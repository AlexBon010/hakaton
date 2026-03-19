import { Module } from '@nestjs/common'

import { FileProcessController } from './file-process.controller'
import { FileProcessService } from './file-process.service'

@Module({
   controllers: [FileProcessController],
   providers: [FileProcessService],
})
export class FileProcessModule {}
