import { Injectable, Logger } from '@nestjs/common'
import { getDocumentProxy } from 'unpdf'
import { PDFDocument, PDFName, PDFNumber, PDFString } from 'pdf-lib'

import { AiRepository } from '../ollama/ai.repository'
import { SearchService } from '../search/search.service'
import { SearchResult } from '../qdrant/qdrant.service'

import {
   AiPriorityResult,
   Change,
   CompareResult,
   Difference,
   PRIORITY_COLORS,
   Priority,
   VectorRecord,
} from './documents.types'

interface TextSpan {
   str: string
   x: number
   y: number
   width: number
   height: number
}

interface PageInfo {
   text: string
   spans: TextSpan[]
   width: number
   height: number
}

interface FoundText {
   pageIndex: number
   rects: Array<{ x: number; y: number; w: number; h: number }>
}

@Injectable()
export class DocumentsService {
   private readonly logger = new Logger(DocumentsService.name)

   constructor(
      private readonly searchService: SearchService,
      private readonly aiRepository: AiRepository,
   ) {}

   async compare(oldBuffer: Buffer, newBuffer: Buffer): Promise<CompareResult> {
      const [oldPages, newPages] = await Promise.all([
         this.extractPagesWithPositions(oldBuffer),
         this.extractPagesWithPositions(newBuffer),
      ])

      const oldText = oldPages.map((p) => p.text).join('\n')
      const newText = newPages.map((p) => p.text).join('\n')

      const differences = this.computeDiff(oldText, newText)
      this.logger.log(`Found ${differences.length} differences`)

      if (differences.length === 0) {
         return {
            annotatedOldDoc: oldBuffer.toString('base64'),
            annotatedNewDoc: newBuffer.toString('base64'),
            changes: [],
            vectorContext: [],
         }
      }

      const context = await this.findContext(differences)
      this.logger.log(`Fetched ${context.length} context records from Qdrant`)

      const priorities = await this.analyzePriorities(differences, context)
      this.logger.log(`AI analysis complete`)

      const [annotatedOld, annotatedNew] = await Promise.all([
         this.annotatePdf(oldBuffer, oldPages, differences, priorities, 'old'),
         this.annotatePdf(newBuffer, newPages, differences, priorities, 'new'),
      ])

      const changes: Change[] = differences.map((diff) => {
         const found = priorities.find((p) => p.index === diff.index)
         const annotationId = `ann-${String(diff.index).padStart(3, '0')}`
         return { ...diff, priority: found?.priority ?? 'doubtful', annotationId }
      })

      const vectorContext: VectorRecord[] = context.map((r) => ({
         score: r.score,
         actName: r.payload.act_name,
         article: r.payload.article,
         chunkId: r.payload.chunk_id,
         text: r.payload.text,
      }))

      return {
         annotatedOldDoc: annotatedOld.toString('base64'),
         annotatedNewDoc: annotatedNew.toString('base64'),
         changes,
         vectorContext,
      }
   }

   private async extractPagesWithPositions(buffer: Buffer): Promise<PageInfo[]> {
      const data = new Uint8Array(buffer)
      const doc = await getDocumentProxy(data)
      const pages: PageInfo[] = []

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
         const page = await doc.getPage(pageNum)
         const viewport = page.getViewport({ scale: 1 })
         const content = await page.getTextContent()

         const spans: TextSpan[] = []
         let text = ''

         for (const item of content.items) {
            if (!('str' in item)) continue
            const ti = item as {
               str: string
               transform: number[]
               width: number
               height: number
               hasEOL?: boolean
            }
            if (ti.str) {
               spans.push({
                  str: ti.str,
                  x: ti.transform[4],
                  y: ti.transform[5],
                  width: ti.width ?? 0,
                  height: ti.height || Math.abs(ti.transform[3]) || 12,
               })
            }
            text += ti.str ?? ''
            if (ti.hasEOL) text += '\n'
         }

         pages.push({
            text,
            spans,
            width: viewport.width,
            height: viewport.height,
         })
      }

      await doc.destroy()
      return pages
   }

   private findSpansForText(pages: PageInfo[], searchText: string): FoundText | null {
      const query = searchText.replace(/\s+/g, ' ').trim().toLowerCase()
      if (!query || query.length < 5) return null

      const querySlice = query.slice(0, 120)

      for (let pi = 0; pi < pages.length; pi++) {
         const page = pages[pi]
         const spans = page.spans.filter((s) => s.str.trim())
         if (spans.length === 0) continue

         const entries: Array<{ idx: number; start: number; len: number }> = []
         let concat = ''

         for (let i = 0; i < spans.length; i++) {
            if (concat && !concat.endsWith(' ') && !spans[i].str.startsWith(' ')) {
               concat += ' '
            }
            const start = concat.length
            concat += spans[i].str
            entries.push({ idx: i, start, len: spans[i].str.length })
         }

         const norm2orig: number[] = []
         let prevSpace = true

         for (let ci = 0; ci < concat.length; ci++) {
            if (/\s/.test(concat[ci])) {
               if (!prevSpace) {
                  norm2orig.push(ci)
                  prevSpace = true
               }
            } else {
               norm2orig.push(ci)
               prevSpace = false
            }
         }

         const normalized = norm2orig.map((oi) => concat[oi].toLowerCase()).join('')
         const matchPos = normalized.indexOf(querySlice)
         if (matchPos === -1) continue

         const matchEndNorm = Math.min(matchPos + query.length, normalized.length)
         const origStart = norm2orig[matchPos]
         const origEnd = norm2orig[Math.min(matchEndNorm - 1, norm2orig.length - 1)] + 1

         const matched: TextSpan[] = []
         for (const entry of entries) {
            const entryEnd = entry.start + entry.len
            if (entryEnd > origStart && entry.start < origEnd) {
               matched.push(spans[entry.idx])
            }
         }

         if (matched.length === 0) continue

         const lines: TextSpan[][] = []
         for (const span of matched) {
            let added = false
            for (const line of lines) {
               if (Math.abs(line[0].y - span.y) < Math.max(3, span.height * 0.5)) {
                  line.push(span)
                  added = true
                  break
               }
            }
            if (!added) lines.push([span])
         }

         const rects = lines.map((lineSpans) => ({
            x: Math.min(...lineSpans.map((s) => s.x)),
            y: Math.min(...lineSpans.map((s) => s.y)),
            w:
               Math.max(...lineSpans.map((s) => s.x + s.width)) -
               Math.min(...lineSpans.map((s) => s.x)),
            h: Math.max(...lineSpans.map((s) => s.height)),
         }))

         return { pageIndex: pi, rects }
      }

      return null
   }

   private computeDiff(oldText: string, newText: string): Difference[] {
      const tokenize = (text: string): string[] =>
         text
            .split(/\n{2,}|\n/)
            .map((s) => s.replace(/\s+/g, ' ').trim())
            .filter((s) => s.length > 15)

      const oldTokens = tokenize(oldText)
      const newTokens = tokenize(newText)

      const m = oldTokens.length
      const n = newTokens.length
      const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

      for (let i = 1; i <= m; i++) {
         for (let j = 1; j <= n; j++) {
            if (oldTokens[i - 1] === newTokens[j - 1]) {
               dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
               dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
            }
         }
      }

      const ops: Array<{ type: 'same' | 'del' | 'ins'; text: string }> = []
      let i = m
      let j = n

      while (i > 0 || j > 0) {
         if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
            ops.unshift({ type: 'same', text: oldTokens[i - 1] })
            i--
            j--
         } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            ops.unshift({ type: 'ins', text: newTokens[j - 1] })
            j--
         } else {
            ops.unshift({ type: 'del', text: oldTokens[i - 1] })
            i--
         }
      }

      const differences: Difference[] = []
      let idx = 1
      const pendingDels: string[] = []

      for (const op of ops) {
         if (op.type === 'del') {
            pendingDels.push(op.text)
         } else if (op.type === 'ins') {
            const oldFormulation = pendingDels.shift() ?? ''
            differences.push({ index: idx++, oldFormulation, newFormulation: op.text })
         } else {
            while (pendingDels.length > 0) {
               differences.push({ index: idx++, oldFormulation: pendingDels.shift()!, newFormulation: '' })
            }
         }
      }

      while (pendingDels.length > 0) {
         differences.push({ index: idx++, oldFormulation: pendingDels.shift()!, newFormulation: '' })
      }

      return differences
   }

   private async findContext(differences: Difference[]): Promise<SearchResult[]> {
      const query = differences
         .slice(0, 5)
         .map((d) => `${d.oldFormulation} ${d.newFormulation}`)
         .join(' ')
         .slice(0, 500)

      return this.searchService.findMostSimilar(query)
   }

   private async analyzePriorities(
      differences: Difference[],
      context: SearchResult[],
   ): Promise<AiPriorityResult[]> {
      const contextBlock = context
         .map((r, i) => {
            const { act_name, article, text, chunk_id } = r.payload
            return [
               `[${i + 1}] Акт: "${act_name}", Статья: ${article} (chunk_id: ${chunk_id}), релевантность: ${r.score.toFixed(4)}`,
               `    Содержание: "${text}"`,
            ].join('\n')
         })
         .join('\n\n')

      const prompt = `Ты — эксперт по юридическим документам. Проанализируй изменения между версиями документа и определи приоритет каждого изменения с учётом действующей правовой базы.

Релевантные статьи из правовой базы (контекст):
${contextBlock}

Список изменений:
${JSON.stringify(differences, null, 2)}

Для каждого изменения определи приоритет:
- "safely" — безопасное изменение, не создаёт правовых рисков
- "doubtful" — требует дополнительной проверки юристом
- "contradictory" — потенциальное противоречие действующему законодательству

Требования к ответу (верни СТРОГО JSON массив без markdown и дополнительного текста):
[
  { "index": <номер изменения>, "priority": "safely" | "doubtful" | "contradictory" }
]`

      const raw = await this.aiRepository.complete(prompt)
      return this.parseAiResponse(raw, differences)
   }

   private parseAiResponse(raw: string, differences: Difference[]): AiPriorityResult[] {
      try {
         const clean = raw.replace(/```(?:json)?\n?/g, '').trim()
         const start = clean.indexOf('[')
         const end = clean.lastIndexOf(']')
         if (start !== -1 && end !== -1) {
            const parsed: AiPriorityResult[] = JSON.parse(clean.slice(start, end + 1))
            if (Array.isArray(parsed)) return parsed
         }
      } catch (e) {
         this.logger.warn(`Failed to parse AI response: ${e}`)
      }

      return differences.map((d) => ({ index: d.index, priority: 'doubtful' as Priority }))
   }

   private async annotatePdf(
      buffer: Buffer,
      pages: PageInfo[],
      differences: Difference[],
      priorities: AiPriorityResult[],
      side: 'old' | 'new',
   ): Promise<Buffer> {
      const pdfDoc = await PDFDocument.load(buffer)
      const pdfPages = pdfDoc.getPages()

      for (const diff of differences) {
         const priority = priorities.find((p) => p.index === diff.index)?.priority ?? 'doubtful'
         const searchText = side === 'old' ? diff.oldFormulation : diff.newFormulation
         if (!searchText) continue

         const found = this.findSpansForText(pages, searchText)
         if (!found || found.rects.length === 0) continue
         if (found.pageIndex >= pdfPages.length) continue

         const page = pdfPages[found.pageIndex]
         const color = PRIORITY_COLORS[priority]

         const allQuadPoints: number[] = []
         let rLeft = Infinity
         let rBottom = Infinity
         let rRight = -Infinity
         let rTop = -Infinity

         for (const r of found.rects) {
            const left = r.x
            const bottom = r.y
            const right = r.x + r.w
            const top = r.y + r.h

            allQuadPoints.push(left, top, right, top, left, bottom, right, bottom)

            rLeft = Math.min(rLeft, left)
            rBottom = Math.min(rBottom, bottom)
            rRight = Math.max(rRight, right)
            rTop = Math.max(rTop, top)
         }

         const annotRef = pdfDoc.context.nextRef()
         const annotationId = `ann-${String(diff.index).padStart(3, '0')}`
         const annotDict = pdfDoc.context.obj({
            Type: PDFName.of('Annot'),
            Subtype: PDFName.of('Highlight'),
            Rect: [rLeft, rBottom, rRight, rTop].map((v) => PDFNumber.of(v)),
            QuadPoints: allQuadPoints.map((v) => PDFNumber.of(v)),
            C: color.map((v) => PDFNumber.of(v)),
            CA: PDFNumber.of(0.35),
            NM: PDFString.of(annotationId),
            F: PDFNumber.of(4),
         })

         pdfDoc.context.assign(annotRef, annotDict)

         const existingAnnots = page.node.get(PDFName.of('Annots'))
         if (existingAnnots && 'push' in existingAnnots) {
            ;(existingAnnots as any).push(annotRef)
         } else {
            page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotRef]))
         }
      }

      return Buffer.from(await pdfDoc.save())
   }
}
