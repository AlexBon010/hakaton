import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { Ollama } from 'ollama'

const BGE_MODEL = 'bge-m3:567m'
const RERANKER_MODEL = 'B-A-M-N/qwen3-reranker-0.6b-fp16'

/**
 * Qwen3-Reranker prompt format (vllm docs / huggingface):
 * Cross-encoder: видит оба текста одновременно, отвечает yes/no.
 */
const RERANKER_PREFIX = '<|im_start|>system\nJudge whether the Document meets the requirements based on the Query and the Instruct provided. Note that the answer can only be "yes" or "no".<|im_end|>\n<|im_start|>user\n'
const RERANKER_SUFFIX = '<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n'
const RERANKER_INSTRUCTION = 'Определи, насколько Document семантически соответствует Query. Учитывай отрицание, смысл целиком, а не отдельные слова.'

function formatRerankerPrompt(text1: string, text2: string): string {
   return `${RERANKER_PREFIX}<Instruct>: ${RERANKER_INSTRUCTION}\n<Query>: ${text1}\n<Document>: ${text2}${RERANKER_SUFFIX}`
}

/**
 * BGE-M3 Hybrid Ranking: s_rank = w1·s_dense + w2·s_reranker
 * @see https://bge-model.com/bge/bge_m3.html
 */
function weightedFusion(scores: number[], weights: number[]): number {
   const sumW = weights.reduce((a, b) => a + b, 0)
   return scores.reduce((acc, s, i) => acc + s * (weights[i] / sumW), 0)
}

@Injectable()
export class EmbeddingRepository {
   private client: Ollama
   private useMultiModel: boolean
   private wBge: number
   private wReranker: number

   constructor(private readonly config: ConfigService) {
      const url = this.config.getOrThrow<string>('OLLAMA_EMBEDDING_URL')
      this.client = new Ollama({ host: url })
      this.useMultiModel = this.config.getOrThrow<string>('EMBEDDING_MULTI_MODEL') === 'true'
      if (this.useMultiModel) {
         this.wBge = parseFloat(this.config.getOrThrow<string>('EMBEDDING_WEIGHT_BGE'))
         this.wReranker = parseFloat(this.config.getOrThrow<string>('EMBEDDING_WEIGHT_RERANKER'))
      } else {
         this.wBge = 1
         this.wReranker = 0
      }
   }

   private async embedSingle(model: string, input: string): Promise<number[]> {
      const response = await this.client.embed({ model, input })
      const vec = response.embeddings?.[0]
      if (!vec) throw new Error(`No embedding from model ${model}`)
      return vec
   }

   async embed(text: string): Promise<number[]> {
      return this.embedSingle(BGE_MODEL, text)
   }

   /**
    * Reranker (cross-encoder): видит оба текста одновременно.
    * Qwen3-Reranker отвечает "yes"/"no".
    * @returns score в [0, 1], где 1 = полное соответствие
    */
   private async rerank(text1: string, text2: string): Promise<number> {
      const prompt = formatRerankerPrompt(text1, text2)
      const response = await this.client.generate({
         model: RERANKER_MODEL,
         prompt,
         stream: false,
         options: { temperature: 0, num_predict: 1 },
      })
      const answer = response.response.trim().toLowerCase()
      if (answer === 'yes') return 1.0
      if (answer === 'no') return 0.0
      return 0.5
   }

   /**
    * 2-компонентный скоринг:
    * 1. BGE-M3 cosine similarity (dense retrieval, быстрый)
    * 2. Qwen3-Reranker cross-encoder (точный, различает отрицание)
    * s_rank = w1·s_bge + w2·s_reranker
    */
   async compareSimilarity(text1: string, text2: string): Promise<number> {
      if (this.useMultiModel) {
         const [bge1, bge2, rerankerScore] = await Promise.all([
            this.embedSingle(BGE_MODEL, text1),
            this.embedSingle(BGE_MODEL, text2),
            this.rerank(text1, text2),
         ])
         const simBge = await this.cosineSimilarity(bge1, bge2)
         const simBgeNorm = (simBge + 1) / 2

         const combined = weightedFusion(
            [simBgeNorm, rerankerScore],
            [this.wBge, this.wReranker],
         )
         console.log(`BGE: ${simBge.toFixed(4)}, Reranker: ${rerankerScore.toFixed(4)}, Combined: ${combined.toFixed(4)}`)
         return Math.max(0, Math.min(1, combined))
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
         let settled = false

         const settle = (fn: (v: unknown) => void, val: unknown) => {
            if (settled) return
            settled = true
            fn(val)
         }

         worker.on('message', (result) => {
            settle(resolve, result)
            worker.terminate()
         })
         worker.on('error', (err) => {
            settle(reject, err)
            worker.terminate()
         })
         worker.on('exit', (code) => {
            if (code !== 0) settle(reject, new Error(`Worker stopped with exit code ${code}`))
            else settle(reject, new Error('Worker exited without sending result'))
         })
      })
   }
}
