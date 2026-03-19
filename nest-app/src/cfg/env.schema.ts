import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class EnvironmentSchema {
   @IsNotEmpty()
   @IsNumber()
   PORT: number

   @IsNotEmpty()
   @IsString()
   OLLAMA_EMBEDDING_URL: string

   @IsNotEmpty()
   @IsString()
   OLLAMA_LLM_URL: string

   @IsNotEmpty()
   @IsString()
   QDRANT_URL: string
}
