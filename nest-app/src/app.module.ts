import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { CfgModule } from './cfg/cfg.module'
import { DocumentsModule } from './documents/documents.module'
import { FileProcessModule } from './file-process/file-process.module'
import { OllamaModule } from './ollama/ollama.module'
import { QdrantModule } from './qdrant/qdrant.module'
import { SearchModule } from './search/search.module'
import { SeedModule } from './seed/seed.module'

@Module({
   imports: [
      CfgModule,
      QdrantModule,
      FileProcessModule,
      OllamaModule,
      SeedModule,
      SearchModule,
      DocumentsModule,
   ],
   controllers: [AppController],
})
export class AppModule {}
