import {
   Controller,
   Post,
   UploadedFiles,
   UseInterceptors,
   BadRequestException,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'

import { DocumentsService } from './documents.service'
import { CompareResult } from './documents.types'

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
   constructor(private readonly documentsService: DocumentsService) {}

   @Post('compare')
   @ApiOperation({
      summary: 'Compare two PDF documents and annotate differences',
      description:
         'Accepts two PDF files, extracts text, computes diff, gets legal context from vector DB, analyzes priorities via AI, and returns both PDFs with highlight annotations.',
   })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      schema: {
         type: 'object',
         required: ['oldDoc', 'newDoc'],
         properties: {
            oldDoc: { type: 'string', format: 'binary', description: 'PDF of the old document version' },
            newDoc: { type: 'string', format: 'binary', description: 'PDF of the new document version' },
         },
      },
   })
   @ApiResponse({
      status: 200,
      description: 'Annotated PDFs (base64) and list of differences with priorities',
      schema: {
         type: 'object',
         properties: {
            annotatedOldDoc: { type: 'string', description: 'Base64-encoded annotated old PDF' },
            annotatedNewDoc: { type: 'string', description: 'Base64-encoded annotated new PDF' },
            changes: {
               type: 'array',
               items: {
                  type: 'object',
                  properties: {
                     annotationId: { type: 'string' },
                     index: { type: 'number' },
                     priority: { type: 'string', enum: ['safely', 'doubtful', 'contradictory'] },
                     oldFormulation: { type: 'string' },
                     newFormulation: { type: 'string' },
                  },
               },
            },
            vectorContext: {
               type: 'array',
               description: 'Top-3 relevant records from vector DB used as AI context',
               items: {
                  type: 'object',
                  properties: {
                     score: { type: 'number', description: 'Cosine similarity score' },
                     actName: { type: 'string', description: 'Name of the legal act' },
                     article: { type: 'string', description: 'Article number' },
                     chunkId: { type: 'string', description: 'Chunk identifier' },
                     text: { type: 'string', description: 'Text content of the article chunk' },
                  },
               },
            },
         },
      },
   })
   @UseInterceptors(
      FileFieldsInterceptor(
         [
            { name: 'oldDoc', maxCount: 1 },
            { name: 'newDoc', maxCount: 1 },
         ],
         { storage: memoryStorage() },
      ),
   )
   async compare(
      @UploadedFiles()
      files: { oldDoc?: { buffer: Buffer }[]; newDoc?: { buffer: Buffer }[] },
   ): Promise<CompareResult> {
      if (!files?.oldDoc?.[0] || !files?.newDoc?.[0]) {
         throw new BadRequestException('Both oldDoc and newDoc PDF files are required')
      }

      const oldBuffer = files.oldDoc[0].buffer
      const newBuffer = files.newDoc[0].buffer

      return this.documentsService.compare(oldBuffer, newBuffer)
   }
}
