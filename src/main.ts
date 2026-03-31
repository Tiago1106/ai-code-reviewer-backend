import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Body size limit (200KB)
  app.useBodyParser('json', { limit: '200kb' });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const webOrigin = configService.get<string>(
    'WEB_ORIGIN',
    'http://localhost:3000',
  );
  app.enableCors({
    origin: webOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Code Reviewer API')
    .setDescription(
      'API para enviar código e receber um code review estruturado.',
    )
    .setVersion('0.1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  // Start
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
void bootstrap();
