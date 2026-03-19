import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { CfgModule } from './cfg/cfg.module';
import { FileProcessModule } from './file-process/file-process.module';
import { OllamaModule } from './ollama/ollama.module';
import { PostgresModule } from './postgres/postgres.module';
import { QdrantModule } from './qdrant/qdrant.module';

@Module({
  imports: [
    CfgModule,
    // PostgresModule,
    // QdrantModule,
    FileProcessModule,
    OllamaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
