import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class EnvironmentSchema {
   @IsNotEmpty()
   @IsNumber()
   PORT: number

   @IsNotEmpty()
   @IsString()
   POSTGRES_URL: string

   @IsString()
   OLLAMA_EMBEDDING_URL?: string

   @IsString()
   OLLAMA_LLM_URL?: string
}
