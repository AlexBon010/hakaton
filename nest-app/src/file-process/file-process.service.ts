import { Injectable } from '@nestjs/common'
import { extractText } from 'unpdf'

import { EmbeddingRepository } from '../ollama/embedding.repository'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export interface ExtractResult {
   text: string
   totalPages: number
}

@Injectable()
export class FileProcessService {
   constructor(private readonly embeddingRepository: EmbeddingRepository) {}

   async extractTextFromPdf(buffer: Buffer): Promise<ExtractResult> {
      if (buffer.length > MAX_FILE_SIZE) {
         throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit`)
      }

      const data = new Uint8Array(buffer)
      const { text, totalPages } = await extractText(data, { mergePages: true })

      return {
         text: typeof text === 'string' ? text : (text as string[]).join('\n'),
         totalPages,
      }
   }

   async compareSimilarity(oldBuffer: Buffer, newBuffer: Buffer): Promise<number> {
      const [oldDoc, newDoc] = await Promise.all([
         this.extractTextFromPdf(oldBuffer),
         this.extractTextFromPdf(newBuffer),
      ])

      const similarity = await this.embeddingRepository.compareSimilarity(
         oldDoc.text,
         newDoc.text,
      )
      console.log('Similarity:', similarity)
      return similarity
   }
}
