import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CfgModule } from './cfg/cfg.module';

@Module({
  imports: [CfgModule],
  controllers: [AppController],
})
export class AppModule {}
