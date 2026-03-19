import { Module } from '@nestjs/common'

import { AiRepository } from './ai.repository'
import { EmbeddingRepository } from './embedding.repository'

@Module({
   providers: [EmbeddingRepository, AiRepository],
   exports: [EmbeddingRepository, AiRepository],
})
export class OllamaModule {}
