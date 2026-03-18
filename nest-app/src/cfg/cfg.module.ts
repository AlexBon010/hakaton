import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import path from 'path'

import { EnvironmentSchema } from './env.schema'
import { validate } from './cfg.helper'

const envFilePath = path.resolve(__dirname, "../../../.env");

@Module({
   imports: [
      ConfigModule.forRoot({
         envFilePath,
         isGlobal: true,
         expandVariables: true,
         validate: validate(EnvironmentSchema),
      }),
   ],
})
export class CfgModule {}
