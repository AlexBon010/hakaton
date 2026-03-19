import { parentPort } from 'worker_threads'

type Request = { id: number; a: number[]; b: number[] }

function cosineSimilarity(a: number[], b: number[]): number {
   if (a.length !== b.length) {
      throw new Error('Vectors must have same length')
   }
   let dot = 0
   let normA = 0
   let normB = 0
   for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
   }
   const mag = Math.sqrt(normA) * Math.sqrt(normB)
   if (mag === 0) return 0
   return Math.max(-1, Math.min(1, dot / mag))
}

parentPort!.on('message', (msg: Request) => {
   try {
      parentPort!.postMessage({ id: msg.id, result: cosineSimilarity(msg.a, msg.b) })
   } catch (err) {
      parentPort!.postMessage({ id: msg.id, error: (err as Error).message })
   }
})
