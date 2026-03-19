import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QdrantClient } from '@qdrant/js-client-rest'

export interface PointPayload {
   act_code: string
   act_name: string
   article: string
   chunk: number
   chunk_id: string
   text: string
   [key: string]: unknown
}

export interface UpsertPoint {
   id: number
   vector: number[]
   payload: PointPayload
}

export interface SearchResult {
   score: number
   payload: PointPayload
}

@Injectable()
export class QdrantService {
   private client: QdrantClient
   private readonly logger = new Logger(QdrantService.name)

   constructor(private readonly config: ConfigService) {
      const url = this.config.get<string>('QDRANT_URL')
      this.client = new QdrantClient({ url })
   }

   async ensureCollection(name: string, vectorSize: number): Promise<void> {
      const collections = await this.client.getCollections()
      const exists = collections.collections.some((c) => c.name === name)
      if (exists) {
         this.logger.log(`Collection "${name}" already exists`)
         return
      }
      await this.client.createCollection(name, {
         vectors: { size: vectorSize, distance: 'Cosine' },
      })
      this.logger.log(`Collection "${name}" created (dim=${vectorSize}, cosine)`)

      await this.createPayloadIndexes(name)
   }

   async createPayloadIndexes(name: string): Promise<void> {
      const indexes: { field: string; schema: 'keyword' | 'integer' | 'text' }[] = [
         { field: 'act_code', schema: 'keyword' },
         { field: 'act_name', schema: 'keyword' },
         { field: 'article', schema: 'keyword' },
         { field: 'chunk', schema: 'integer' },
         { field: 'chunk_id', schema: 'keyword' },
      ]

      for (const idx of indexes) {
         await this.client.createPayloadIndex(name, {
            field_name: idx.field,
            field_schema: idx.schema,
            wait: true,
         })
         this.logger.log(`Index created: ${idx.field} (${idx.schema})`)
      }
   }

   async upsertBatch(name: string, points: UpsertPoint[]): Promise<void> {
      await this.client.upsert(name, {
         wait: true,
         points: points.map((p) => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
         })),
      })
   }

   async getCount(name: string): Promise<number> {
      const info = await this.client.getCollection(name)
      return info.points_count ?? 0
   }

   async getLastPoint(name: string): Promise<{ id: number | string; vector: number[]; payload: PointPayload } | null> {
      const info = await this.client.getCollection(name)
      const total = info.points_count ?? 0
      if (total === 0) return null

      const { points } = await this.client.scroll(name, {
         limit: total,
         with_payload: true,
         with_vector: true,
      })
      if (!points.length) return null

      const p = points[points.length - 1]
      return {
         id: p.id,
         vector: p.vector as number[],
         payload: p.payload as unknown as PointPayload,
      }
   }

   async searchNearest(name: string, vector: number[], limit: number): Promise<SearchResult[]> {
      const results = await this.client.search(name, {
         vector,
         limit,
         with_payload: true,
      })
      return results.map((r) => ({
         score: r.score,
         payload: r.payload as unknown as PointPayload,
      }))
   }
}
