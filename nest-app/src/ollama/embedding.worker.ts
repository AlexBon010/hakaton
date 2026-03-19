import { parentPort, workerData } from 'worker_threads'

function cosineSimilarity(a: number[], b: number[]): number {
   if (a.length !== b.length) {
      throw new Error('Vectors must have same length')
   }
   const dotProduct = a.reduce((sum, x, i) => sum + x * b[i], 0)
   const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0))
   const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0))
   const magnitude = normA * normB
   if (magnitude === 0) return 0
   const similarity = dotProduct / magnitude
   return Math.max(-1, Math.min(1, similarity))
}

const { a, b } = workerData as { a: number[]; b: number[] }
parentPort!.postMessage(cosineSimilarity(a, b))
