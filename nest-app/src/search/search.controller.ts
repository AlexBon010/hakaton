import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

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

   @Post('similar')
   @ApiOperation({ summary: 'Find top 3 most similar records by plain text query' })
   @ApiConsumes('text/plain', 'application/json')
   @ApiBody({ schema: { type: 'string', example: 'увольнение по собственному желанию' } })
   @ApiResponse({ status: 200, description: 'Top 3 similar records with score and payload' })
   async findSimilar(@Body() body: any) {
      const query = typeof body === 'string' ? body : body?.query
      const results = await this.searchService.findMostSimilar(query)
      return { results }
   }
}
