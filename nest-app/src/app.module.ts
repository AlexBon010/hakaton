import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'

import { AppController } from './app.controller';
import { CfgModule } from './cfg/cfg.module';
import { FileProcessModule } from './file-process/file-process.module';
import { OllamaModule } from './ollama/ollama.module';
import { PostgresModule } from './postgres/postgres.module';
import { QdrantModule } from './qdrant/qdrant.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'docs'),
      serveRoot: '/api/examples',
    }),
    CfgModule,
    PostgresModule,
    QdrantModule,
    FileProcessModule,
    OllamaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
