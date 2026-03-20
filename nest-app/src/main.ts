import { ClassSerializerInterceptor, ConsoleLogger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cookieParser from 'cookie-parser';

import { json, text } from 'express'
import { setGlobalDispatcher, Agent } from 'undici'

import { AppModule } from './app.module'

setGlobalDispatcher(
   new Agent({
      headersTimeout: 15 * 60 * 1000,
      bodyTimeout: 15 * 60 * 1000,
   })
)

async function bootstrap() {
   const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
         colors: true,
         timestamp: true,
         prefix: 'Backend'
      })
   })
   const config = app.get(ConfigService)

   const port = config.getOrThrow<number>('PORT')



   app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
   })

   app.setGlobalPrefix('api')

   app.use(cookieParser());
   app.use(json())
   app.use(text())

   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         forbidNonWhitelisted: true
      })
   )

   app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector), {
         excludeExtraneousValues: true
      })
   )

    const swaggerConfig = new DocumentBuilder()
       .setTitle('Backend api')
       .setDescription('Backend API description')
       .setVersion('1.0')
       .build()
    const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, documentFactory)


   await app.listen(port)
}
void bootstrap()
