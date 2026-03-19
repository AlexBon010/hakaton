import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Document } from './entities/document.entity'
import { PostgresService } from './postgres.service'

@Module({
   imports: [
      TypeOrmModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            type: 'postgres',
            url: config.getOrThrow<string>('POSTGRES_URL'),
            autoLoadEntities: true,
            synchronize: true,
         }),
      }),
      TypeOrmModule.forFeature([Document]),
   ],
   providers: [PostgresService],
   exports: [PostgresService],
})
export class PostgresModule {}
