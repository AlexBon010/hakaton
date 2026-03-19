import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'

import { AppController } from './app.controller';
import { CfgModule } from './cfg/cfg.module';
import { DbModule } from './db/db.module';
import { FileProcessModule } from './file-process/file-process.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'docs'),
      serveRoot: '/api/examples',
    }),
    CfgModule,
    // DbModule,
    FileProcessModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
