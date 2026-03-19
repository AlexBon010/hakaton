import { Module } from '@nestjs/common'

import { OllamaModule } from '../ollama/ollama.module'
import { QdrantModule } from '../qdrant/qdrant.module'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'

@Module({
   imports: [OllamaModule, QdrantModule],
   controllers: [SearchController],
   providers: [SearchService],
})
export class SearchModule {}
