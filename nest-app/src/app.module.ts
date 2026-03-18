import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CfgModule } from './cfg/cfg.module';
import { DbModule } from './db/db.module.js';

@Module({
  imports: [CfgModule, DbModule],
  controllers: [AppController],
})
export class AppModule {}
