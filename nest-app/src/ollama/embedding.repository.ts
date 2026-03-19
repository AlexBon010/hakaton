import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { Ollama } from 'ollama'

const BGE_MODEL = 'bge-m3:567m'
const NOMIC_MODEL = 'nomic-embed-text-v2-moe'
const NOMIC_DOC_PREFIX = 'search_document: '

/**
 * BGE-M3 Hybrid Ranking (bge-model.com/bge/bge_m3.html):
 * s_rank = w1·s_dense + w2·s_lex + w3·s_mul
 * Для нескольких моделей — взвешенная линейная комбинация similarity.
 */
function weightedLinearFusion(scores: number[], weights: number[]): number {
   const w = weights.length === scores.length ? weights : scores.map(() => 1 / scores.length)
   const sumW = w.reduce((a, b) => a + b, 0)
   return scores.reduce((acc, s, i) => acc + s * (w[i] / sumW), 0)
}

@Injectable()
export class EmbeddingRepository {
   private client: Ollama
   private useMultiModel: boolean
   private weights: number[]

   constructor(private readonly config: ConfigService) {
      const url = this.config.get<string>('OLLAMA_EMBEDDING_URL')
      this.client = new Ollama({ host: url })
      this.useMultiModel = this.config.get<string>('EMBEDDING_MULTI_MODEL', 'true') === 'true'
      if (this.useMultiModel) {
         const wBge = this.config.getOrThrow<number>('EMBEDDING_WEIGHT_BGE')
         const wNomic = this.config.getOrThrow<number>('EMBEDDING_WEIGHT_NOMIC')
         this.weights = [wBge, wNomic]
      } else {
         this.weights = []
      }
   }

   private async embedSingle(model: string, text: string, prefix = ''): Promise<number[]> {
      const input = prefix ? `${prefix}${text}` : text
      const response = await this.client.embed({ model, input })
      const vec = response.embeddings?.[0]
      if (!vec) throw new Error(`No embedding from model ${model}`)
      return vec
   }

   async embed(text: string): Promise<number[]> {
      return this.embedSingle(BGE_MODEL, text)
   }

   /**
    * Late fusion: similarity по каждой модели, затем взвешенная линейная комбинация (BGE-M3).
    * @see https://bge-model.com/bge/bge_m3.html Hybrid Ranking
    */
   async compareSimilarity(text1: string, text2: string): Promise<number> {
      if (this.useMultiModel) {
         const [bge1, bge2, nomic1, nomic2] = await Promise.all([
            this.embedSingle(BGE_MODEL, text1),
            this.embedSingle(BGE_MODEL, text2),
            this.embedSingle(NOMIC_MODEL, text1, NOMIC_DOC_PREFIX),
            this.embedSingle(NOMIC_MODEL, text2, NOMIC_DOC_PREFIX),
         ])
         const [simBge, simNomic] = await Promise.all([
            this.cosineSimilarity(bge1, bge2),
            this.cosineSimilarity(nomic1, nomic2),
         ])
         return Math.max(-1, Math.min(1, weightedLinearFusion([simBge, simNomic], this.weights)))
      }

      const [v1, v2] = await Promise.all([
         this.embedSingle(BGE_MODEL, text1),
         this.embedSingle(BGE_MODEL, text2),
      ])
      return this.cosineSimilarity(v1, v2)
   }

   private cosineSimilarity(a: number[], b: number[]): Promise<number> {
      return new Promise((resolve, reject) => {
         const workerPath = path.join(__dirname, 'embedding.worker.js')
         const worker = new Worker(workerPath, { workerData: { a, b } })
         worker.on('message', resolve)
         worker.on('error', reject)
         worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
         })
      })
   }
}
