import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

interface RawChunk {
   id: string
   article: string
   chunk: number
   text: string
}

interface ActSource {
   file: string
   actCode: string
}

const SOURCES: ActSource[] = [
   { file: 'k_chunks.json', actCode: 'k' },
   // { file: 'tk_chunks.json', actCode: 'tk' },
   { file: 'gk_chunks.json', actCode: 'gk' },
]

@Injectable()
export class DatasetService implements OnModuleInit {
   private readonly logger = new Logger(DatasetService.name)
   private readonly store = new Map<string, string>()

   async onModuleInit(): Promise<void> {
      const datasetDir = path.resolve(__dirname, '..', '..', '..', 'dataset')

      for (const source of SOURCES) {
         const filePath = path.join(datasetDir, source.file)
         this.logger.log(`Parsing ${source.file}...`)

         const raw = await readFile(filePath, 'utf-8')
         const chunks: RawChunk[] = JSON.parse(raw)

         for (const chunk of chunks) {
            this.store.set(`${source.actCode}:${chunk.id}`, chunk.text)
         }

         this.logger.log(`Parsed ${source.file}: ${chunks.length} chunks stored in memory (actCode=${source.actCode})`)
      }

      this.logger.log(`Dataset ready: ${this.store.size} entries in memory`)
   }

   getText(actCode: string, chunkId: string): string | null {
      return this.store.get(`${actCode}:${chunkId}`) ?? null
   }

   getMany(keys: { actCode: string; chunkId: string }[]): (string | null)[] {
      return keys.map((k) => this.getText(k.actCode, k.chunkId))
   }
}
