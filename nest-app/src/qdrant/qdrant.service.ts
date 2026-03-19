import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QdrantClient } from '@qdrant/js-client-rest'

@Injectable()
export class QdrantService {
   private client: QdrantClient

   constructor(private readonly config: ConfigService) {
      const url = this.config.get<string>('QDRANT_URL')
      this.client = new QdrantClient({ url })
   }

   getClient(): QdrantClient {
      return this.client
   }
}
