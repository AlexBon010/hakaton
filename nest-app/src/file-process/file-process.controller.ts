import {
   BadRequestException,
   Controller,
   Post,
   UploadedFiles,
   UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

import { FILE_PROCESS_API_DOCS } from './file-process.api-docs'
import { FileProcessService } from './file-process.service'
import type { CompareDocumentsFiles } from './file-process.types'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const DOCS = FILE_PROCESS_API_DOCS.extract

@ApiTags(FILE_PROCESS_API_DOCS.tags)
@Controller('documents')
export class FileProcessController {
   constructor(private readonly fileProcessService: FileProcessService) {}

   @Post('extract')
   @ApiOperation({ summary: DOCS.summary, description: DOCS.description })
   @ApiConsumes('multipart/form-data')
   @ApiBody({ schema: DOCS.bodySchema })
   @ApiResponse({ status: 200, ...DOCS.response200 })
   @ApiResponse({ status: 400, description: DOCS.response400 })
   @UseInterceptors(
      FileFieldsInterceptor(
         [
            { name: 'oldDoc', maxCount: 1 },
            { name: 'newDoc', maxCount: 1 },
         ],
         {
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (_req, file, cb) => {
               const isPdf = file.mimetype === 'application/pdf'
               if (!isPdf) {
                  cb(new BadRequestException('Only PDF files are allowed'), false)
                  return
               }
               cb(null, true)
            },
         },
      ),
   )
   async extractText(
      @UploadedFiles()
      files: CompareDocumentsFiles,
   ) {
      const oldFile = files.oldDoc?.[0]
      const newFile = files.newDoc?.[0]

      if (!oldFile || !newFile) {
         throw new BadRequestException('Both oldDoc and newDoc PDF files are required')
      }

      const result = await this.fileProcessService.extractTextFromPdfsAsync(
         oldFile.buffer,
         newFile.buffer,
      )

      return {
         oldDoc: {
            text: result.oldDoc.text,
            totalPages: result.oldDoc.totalPages,
         },
         newDoc: {
            text: result.newDoc.text,
            totalPages: result.newDoc.totalPages,
         },
      }
   }
}
