import { Injectable, Logger } from '@nestjs/common'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { EmbeddingRepository } from '../ollama/embedding.repository'
import { QdrantService, UpsertPoint } from '../qdrant/qdrant.service'

const COLLECTION = 'law_chunks'
const VECTOR_SIZE = 1024
const BATCH_SIZE = 50
const INITIAL_ID = 700

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
}

const SOURCES: ActSource[] = [
   { file: 'k_chunks.json', actCode: 'k', actName: 'Конституция Республики Беларусь' },
   // { file: 'tk_chunks.json', actCode: 'tk', actName: 'Трудовой кодекс' },
   // { file: 'gk_chunks.json', actCode: 'gk', actName: 'Гражданский кодекс' },
]

@Injectable()
export class SeedService {
   private readonly logger = new Logger(SeedService.name)

   constructor(
      private readonly embedding: EmbeddingRepository,
      private readonly qdrant: QdrantService,
   ) {}

   async seed(): Promise<{ added: number; totalInDb: number }> {
      this.logger.log('Seed started: parsing datasets and creating records in DB')
      await this.qdrant.ensureCollection(COLLECTION, VECTOR_SIZE)

      const maxId = await this.qdrant.getMaxPointId(COLLECTION)
      let nextId = maxId > 0 ? maxId + 1 : INITIAL_ID
      const countBefore = await this.qdrant.getCount(COLLECTION)
      this.logger.log(
         `ID counter: maxId=${maxId}, nextId=${nextId}, count before seed=${countBefore}`,
      )

      let total = 0
      const datasetDir = path.resolve(__dirname, '..', '..', '..', 'dataset')

      for (const source of SOURCES) {
         const filePath = path.join(datasetDir, source.file)
         const raw = await readFile(filePath, 'utf-8')
         const chunks: RawChunk[] = JSON.parse(raw)

         this.logger.log(`Processing ${source.actCode}: parsing ${source.file}, ${chunks.length} chunks`)

         for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE)
            const batchStartId = nextId

            const points: UpsertPoint[] = await Promise.all(
               batch.map(async (chunk) => {
                  const vector = await this.embedding.embed(chunk.text)
                  const id = nextId++
                  return {
                     id,
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
            const batchEndId = nextId - 1
            this.logger.log(
               `Creating ${points.length} records in DB: ids ${batchStartId}-${batchEndId} (${source.actCode}, batch ${Math.floor(i / BATCH_SIZE) + 1})`,
            )
            await this.qdrant.upsertBatch(COLLECTION, points)
            total += points.length
            this.logger.log(`  ${source.actCode}: saved ${total}/${chunks.length} (batch ${Math.floor(i / BATCH_SIZE) + 1})`)
         }

         this.logger.log(`Done ${source.actCode}: ${chunks.length} chunks`)
      }

      const totalInDb = await this.qdrant.getCount(COLLECTION)
      this.logger.log(
         `Seed complete: added ${total} points, total in DB=${totalInDb}, next ID will be ${nextId}`,
      )
      return { added: total, totalInDb }
   }
}
