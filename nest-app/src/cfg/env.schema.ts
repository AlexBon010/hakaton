import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class EnvironmentSchema {
   @IsNotEmpty()
   @IsNumber()
   PORT: number

   @IsNotEmpty()
   @IsString()
   POSTGRES_URL: string

   @IsNotEmpty()
   @IsString()
   OLLAMA_EMBEDDING_URL: string

   @IsNotEmpty()
   @IsString()
   OLLAMA_LLM_URL: string

   @IsNotEmpty()
   @IsString()
   QDRANT_URL: string

   @IsNotEmpty()
   @IsString()
   @IsIn(['true', 'false'])
   EMBEDDING_MULTI_MODEL: string

   @IsNotEmpty()
   @IsNumber()
   EMBEDDING_WEIGHT_BGE: number

   @IsNotEmpty()
   @IsNumber()
   EMBEDDING_WEIGHT_NOMIC: number
}
