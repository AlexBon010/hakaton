import { Module } from '@nestjs/common'

import { OllamaModule } from '../ollama/ollama.module'
import { SearchModule } from '../search/search.module'

import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'

@Module({
   imports: [OllamaModule, SearchModule],
   controllers: [DocumentsController],
   providers: [DocumentsService],
})
export class DocumentsModule {}
