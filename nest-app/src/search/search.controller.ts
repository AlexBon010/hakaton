import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { SearchService } from './search.service'

class SearchDto {
   query: string
   limit?: number
}

@ApiTags('search')
@Controller('search')
export class SearchController {
   constructor(private readonly searchService: SearchService) {}

   @Post()
   @ApiOperation({ summary: 'Find nearest law chunks by text query' })
   @ApiBody({ type: SearchDto })
   @ApiResponse({ status: 200, description: 'Search results with metadata' })
   async search(@Body() dto: SearchDto) {
      const results = await this.searchService.search(dto.query, dto.limit)
      return { results }
   }
}
