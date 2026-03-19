import { Module } from '@nestjs/common'

import { OllamaModule } from '../ollama/ollama.module'
import { QdrantModule } from '../qdrant/qdrant.module'
import { SeedController } from './seed.controller'
import { SeedService } from './seed.service'

@Module({
   imports: [OllamaModule, QdrantModule],
   controllers: [SeedController],
   providers: [SeedService],
})
export class SeedModule {}
