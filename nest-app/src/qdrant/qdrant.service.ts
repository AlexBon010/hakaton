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
      if (points.length === 0) return

      const ids = points.map((p) => p.id)
      const minId = Math.min(...ids)
      const maxId = Math.max(...ids)
      const idRange = ids.length === 1 ? `id=${minId}` : `ids=${minId}-${maxId}`
      this.logger.log(`DB write: collection="${name}", ${points.length} points, ${idRange}`)

      await this.client.upsert(name, {
         wait: true,
         points: points.map((p) => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
         })),
      })

      this.logger.log(`DB write complete: ${points.length} records saved`)
   }

   async getCount(name: string): Promise<number> {
      try {
         const result = await this.client.count(name, { exact: true })
         return result.count ?? 0
      } catch {
         const info = await this.client.getCollection(name)
         return info.points_count ?? 0
      }
   }

   async getMaxPointId(name: string): Promise<number> {
      const count = await this.getCount(name)
      if (count === 0) return 0

      let maxId = 0
      let offset: number | string | Record<string, unknown> | null | undefined = undefined
      const limit = 100

      do {
         const result = await this.client.scroll(name, {
            limit,
            offset,
            with_payload: false,
            with_vector: false,
         })
         const ids = (result.points ?? []).map((p) => {
            const id = p.id
            if (typeof id === 'number' && Number.isInteger(id)) return id
            if (typeof id === 'string') return parseInt(id, 10) || 0
            return 0
         })
         if (ids.length) maxId = Math.max(maxId, ...ids)
         offset = result.next_page_offset
      } while (offset != null)

      this.logger.log(`getMaxPointId: collection="${name}", count=${count}, maxId=${maxId}`)
      return maxId
   }

   async getLastPoint(name: string): Promise<{ id: number | string; payload: PointPayload } | null> {
      const maxId = await this.getMaxPointId(name)
      if (maxId === 0) return null

      const result = await this.client.retrieve(name, {
         ids: [maxId],
         with_payload: true,
         with_vector: false,
      })
      if (!result.length) return null

      const p = result[0]
      return {
         id: p.id,
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
