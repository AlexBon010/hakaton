import { Injectable } from '@nestjs/common'

import { EmbeddingRepository } from '../ollama/embedding.repository'
import { QdrantService, SearchResult } from '../qdrant/qdrant.service'

const COLLECTION = 'law_chunks'
const DEFAULT_LIMIT = 5

@Injectable()
export class SearchService {
   constructor(
      private readonly embedding: EmbeddingRepository,
      private readonly qdrant: QdrantService,
   ) {}

   async search(query: string, limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
      const vector = await this.embedding.embed(query)
      return this.qdrant.searchNearest(COLLECTION, vector, limit)
   }
}
