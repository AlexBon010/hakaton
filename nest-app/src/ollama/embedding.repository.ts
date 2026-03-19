import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'node:worker_threads'
import path from 'node:path'
import { Ollama } from 'ollama'

const BGE_MODEL = 'bge-m3:567m'

class WorkerBridge {
   private worker: Worker
   private pending = new Map<number, { resolve: (v: number) => void; reject: (e: Error) => void }>()
   private nextId = 0

   constructor(filename: string) {
      const workerPath = path.join(__dirname, filename)
      this.worker = new Worker(workerPath)
      this.worker.on('message', (msg: { id: number; result?: number; error?: string }) => {
         const p = this.pending.get(msg.id)
         if (!p) return
         this.pending.delete(msg.id)
         if (msg.error) p.reject(new Error(msg.error))
         else p.resolve(msg.result!)
      })
      this.worker.on('error', (err) => {
         for (const p of this.pending.values()) p.reject(err)
         this.pending.clear()
      })
   }

   send(payload: Record<string, unknown>): Promise<number> {
      const id = this.nextId++
      return new Promise((resolve, reject) => {
         this.pending.set(id, { resolve, reject })
         this.worker.postMessage({ id, ...payload })
      })
   }

   terminate() {
      this.worker.terminate()
   }
}

@Injectable()
export class EmbeddingRepository implements OnModuleDestroy {
   private client: Ollama
   private cosineWorker: WorkerBridge

   constructor(private readonly config: ConfigService) {
      const url = this.config.getOrThrow<string>('OLLAMA_EMBEDDING_URL')
      this.client = new Ollama({ host: url })
      this.cosineWorker = new WorkerBridge('cosine.worker.js')
   }

   onModuleDestroy() {
      this.cosineWorker.terminate()
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

   async compareSimilarity(text1: string, text2: string): Promise<number> {
      const [v1, v2] = await Promise.all([
         this.embedSingle(BGE_MODEL, text1),
         this.embedSingle(BGE_MODEL, text2),
      ])
      return this.cosineWorker.send({ a: v1, b: v2 })
   }
}
