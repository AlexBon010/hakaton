import { Injectable, Logger } from '@nestjs/common'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { EmbeddingRepository } from '../ollama/embedding.repository'
import { QdrantService, UpsertPoint } from '../qdrant/qdrant.service'

const COLLECTION = 'law_chunks'
const VECTOR_SIZE = 1024
const BATCH_SIZE = 50

interface RawChunk {
   id: string
   article: string
   chunk: number
   text: string
}

interface ActSource {
   file: string
   actCode: string
   actName: string
   idOffset: number
}

const SOURCES: ActSource[] = [
   // { file: 'k_chunks.json', actCode: 'k', actName: 'Конституция Республики Беларусь', idOffset: 0 },
   { file: 'tk_chunks.json', actCode: 'tk', actName: 'Трудовой кодекс', idOffset: 1000 },
   // { file: 'gk_chunks.json', actCode: 'gk', actName: 'Гражданский кодекс', idOffset: 2000 },
]

@Injectable()
export class SeedService {
   private readonly logger = new Logger(SeedService.name)

   constructor(
      private readonly embedding: EmbeddingRepository,
      private readonly qdrant: QdrantService,
   ) {}

   async seed(): Promise<{ total: number }> {
      await this.qdrant.ensureCollection(COLLECTION, VECTOR_SIZE)

      let total = 0
      const datasetDir = path.resolve(__dirname, '..', '..', '..', 'dataset')

      for (const source of SOURCES) {
         const filePath = path.join(datasetDir, source.file)
         const raw = await readFile(filePath, 'utf-8')
         const chunks: RawChunk[] = JSON.parse(raw)

         this.logger.log(`Processing ${source.actCode}: ${chunks.length} chunks from ${source.file}`)

         for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE)
            const points: UpsertPoint[] = await Promise.all(
               batch.map(async (chunk, idx) => {
                  const vector = await this.embedding.embed(chunk.text)
                  return {
                     id: source.idOffset + i + idx,
                     vector,
                     payload: {
                        act_code: source.actCode,
                        act_name: source.actName,
                        article: chunk.article,
                        chunk: chunk.chunk,
                        chunk_id: chunk.id,
                        text: chunk.text,
                     },
                  }
               }),
            )
            await this.qdrant.upsertBatch(COLLECTION, points)
            total += points.length
            this.logger.log(`  ${source.actCode}: upserted ${total} / ? (batch ${Math.floor(i / BATCH_SIZE) + 1})`)
         }

         this.logger.log(`Done ${source.actCode}: ${chunks.length} chunks`)
      }

      this.logger.log(`Seed complete: ${total} points total`)
      return { total }
   }
}
