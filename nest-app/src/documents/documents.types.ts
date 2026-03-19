export type Priority = 'safely' | 'doubtful' | 'contradictory'

export interface Difference {
   index: number
   oldFormulation: string
   newFormulation: string
}

export interface AiPriorityResult {
   index: number
   priority: Priority
}

export interface AnnotatedDifference extends Difference {
   priority: Priority
}

export interface PdfAnnotation {
   id: string
   page: number
   quadPoints: number[]
   color: [number, number, number]
   priority: Priority
   subtype: 'Highlight'
}

export interface VectorRecord {
   score: number
   actName: string
   article: string
   chunkId: string
   text: string
}

export interface CompareResult {
   oldDoc: string
   newDoc: string
   differences: AnnotatedDifference[]
   vectorContext: VectorRecord[]
}

export const PRIORITY_COLORS: Record<Priority, [number, number, number]> = {
   safely: [0, 1, 0],
   doubtful: [1, 1, 0],
   contradictory: [1, 0, 0],
}
