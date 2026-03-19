import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Ollama from 'ollama'

const DEFAULT_EMBEDDING_MODEL = 'bge-m3:567m'
const DEFAULT_LLM_MODEL = 'qwen2.5:7b-instruct'

@Injectable()
export class OllamaService {
   private embeddingClient: InstanceType<typeof Ollama>
   private llmClient: InstanceType<typeof Ollama>

   constructor(private readonly config: ConfigService) {
      const embeddingUrl = this.config.get<string>(
         'OLLAMA_EMBEDDING_URL',
         'http://ollama-embedding:11434',
      )
      const llmUrl = this.config.get<string>('OLLAMA_LLM_URL', 'http://ollama-llm:11434')
      this.embeddingClient = new Ollama({ host: embeddingUrl })
      this.llmClient = new Ollama({ host: llmUrl })
   }

   async embed(text: string | string[], model = DEFAULT_EMBEDDING_MODEL): Promise<number[][]> {
      const input = Array.isArray(text) ? text : [text]
      const response = await this.embeddingClient.embed({ model, input })
      return response.embeddings
   }

   async embedSingle(text: string, model = DEFAULT_EMBEDDING_MODEL): Promise<number[]> {
      const [embedding] = await this.embed(text, model)
      return embedding
   }

   /**
    * Generate text with LLM. Useful for extracting/highlighting changes between texts.
    * @example prompt: "Сравни два текста и выдели все изменения:\n\nТекст 1: ...\nТекст 2: ..."
    */
   async generate(
      prompt: string,
      options?: { model?: string; system?: string; stream?: boolean },
   ): Promise<string> {
      const { model = DEFAULT_LLM_MODEL, system, stream = false } = options ?? {}
      const response = await this.llmClient.generate({
         model,
         prompt,
         system,
         stream,
      })
      return response.response
   }

   /**
    * Generate text highlighting changes between two texts
    */
   async extractChanges(textBefore: string, textAfter: string): Promise<string> {
      const system = `Ты - помощник для анализа текста. Твоя задача - выделять и перечислять изменения между двумя версиями текста.
      Отвечай структурированно: список изменений, каждое с пометкой [добавлено], [удалено] или [изменено].`
      const prompt = `Сравни два текста и выдели все изменения:\n\nТекст ДО:\n${textBefore}\n\nТекст ПОСЛЕ:\n${textAfter}`
      return this.generate(prompt, { system })
   }
}
