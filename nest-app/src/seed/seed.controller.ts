import { Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger'

import { QdrantService } from '../qdrant/qdrant.service'
import { SeedService } from './seed.service'

class SeedResponseDto {
   @ApiProperty({ example: 520, description: 'Количество добавленных чанков в этом запуске' })
   added: number
   @ApiProperty({ example: 845, description: 'Всего записей в БД после seed' })
   totalInDb: number
}

@ApiTags('seed')
@Controller('seed')
export class SeedController {
   constructor(
      private readonly seedService: SeedService,
      private readonly qdrant: QdrantService,
   ) {}

   @Post()
   @ApiOperation({
      summary: 'Загрузка нормативных актов в векторную БД',
      description:
         'Читает JSON-файлы из dataset/, генерирует embeddings (BGE-M3) для каждого чанка ' +
         'и сохраняет векторы с метаданными (act_code, act_name, article, chunk_id) в коллекцию Qdrant. ' +
         'Операция идемпотентна — повторный вызов перезапишет существующие точки.',
   })
   @ApiResponse({ status: 201, description: 'Seed завершён', type: SeedResponseDto })
   @ApiResponse({ status: 500, description: 'Ошибка при генерации embeddings или записи в Qdrant' })
   async seed() {
      return this.seedService.seed()
   }

  @Get('count')
  @ApiOperation({ summary: 'Всего записей в векторной БД' })
  @ApiResponse({ status: 200, description: 'Точное количество точек в коллекции law_chunks' })
  async count() {
     const count = await this.qdrant.getCount('law_chunks')
     return { count }
  }

  @Get('last')
  @ApiOperation({ summary: 'Последняя запись в векторной БД' })
  @ApiResponse({ status: 200, description: 'Последняя точка из коллекции law_chunks с метаданными' })
  async last() {
     const [count, last] = await Promise.all([
        this.qdrant.getCount('law_chunks'),
        this.qdrant.getLastPoint('law_chunks'),
     ])
     return { count, last }
  }
}
