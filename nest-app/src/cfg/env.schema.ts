import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class EnvironmentSchema {
   @IsNotEmpty()
   @IsNumber()
   PORT: number

   @IsNotEmpty()
   @IsString()
   POSTGRES_URL: string
}
