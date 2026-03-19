import { Module } from '@nestjs/common'

import { OllamaModule } from '../ollama/ollama.module'
import { FileProcessController } from './file-process.controller'
import { FileProcessService } from './file-process.service'

@Module({
   imports: [OllamaModule],
   controllers: [FileProcessController],
   providers: [FileProcessService],
})
export class FileProcessModule {}
