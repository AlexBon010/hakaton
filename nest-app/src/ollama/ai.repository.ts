import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Ollama } from 'ollama'

const AI_MODEL = 'qwen2.5:7b-instruct'
const AI_STREAM = false

@Injectable()
export class AiRepository {
   private client: Ollama

   constructor(private readonly config: ConfigService) {
      const url = this.config.get<string>('OLLAMA_LLM_URL')
      this.client = new Ollama({ host: url })
   }

   async complete(prompt: string): Promise<string> {
      const response = await this.client.generate({
         model: AI_MODEL,
         prompt,
         stream: AI_STREAM,
      })
      return response.response
   }
}
