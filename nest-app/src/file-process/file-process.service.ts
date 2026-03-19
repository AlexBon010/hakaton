import { Injectable } from '@nestjs/common'
import { extractText } from 'unpdf'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export interface ExtractResult {
   text: string
   totalPages: number
}

@Injectable()
export class FileProcessService {
   async extractTextFromPdf(buffer: Buffer): Promise<ExtractResult> {
      if (buffer.length > MAX_FILE_SIZE) {
         throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit`)
      }

      const data = new Uint8Array(buffer)
      const { text, totalPages } = await extractText(data, { mergePages: true })

      return {
         text: typeof text === 'string' ? text : (text as string[]).join('\n'),
         totalPages,
      }
   }

   async extractTextFromPdfsAsync(
      oldBuffer: Buffer,
      newBuffer: Buffer,
   ): Promise<{ oldDoc: ExtractResult; newDoc: ExtractResult }> {
      const [oldDoc, newDoc] = await Promise.all([
         this.extractTextFromPdf(oldBuffer),
         this.extractTextFromPdf(newBuffer),
      ])

      return { oldDoc, newDoc }
   }
}
