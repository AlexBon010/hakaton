import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { Ollama } from 'ollama'

const EMBEDDING_MODEL = 'bge-m3:567m'

@Injectable()
export class EmbeddingRepository {
   private client: Ollama

   constructor(private readonly config: ConfigService) {
      const url = this.config.get<string>('OLLAMA_EMBEDDING_URL')
      this.client = new Ollama({ host: url })
   }

   async embed(text: string): Promise<number[]> {
      const response = await this.client.embeddings({
         model: EMBEDDING_MODEL,
         prompt: text,
      })
      return response.embedding
   }

   cosineSimilarity(a: number[], b: number[]): Promise<number> {
      return new Promise((resolve, reject) => {
         const workerPath = path.join(__dirname, 'embedding.worker.js')
         const worker = new Worker(workerPath, {
            workerData: { a, b },
         })
         worker.on('message', resolve)
         worker.on('error', reject)
         worker.on('exit', (code) => {
            if (code !== 0) {
               reject(new Error(`Worker stopped with exit code ${code}`))
            }
         })
      })
   }
}
