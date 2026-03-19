import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { APP_API_DOCS } from './app.api-docs';

@ApiTags(APP_API_DOCS.tags)
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: APP_API_DOCS.health.summary })
  @ApiResponse({ status: 200, description: APP_API_DOCS.health.response200 })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
