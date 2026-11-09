import * as express from 'express';
import { configService } from './config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UPLOADS_DIR } from './modules/uploads/uploads.controller';

async function bootstrap() {
  const winstonLogger = WinstonModule.createLogger(
    configService.getWinstonConfig(),
  );

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTION',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
    logger: winstonLogger,
  });

  app.setGlobalPrefix('v1');
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Serves whatever POST /v1/uploads writes to disk — deliberately outside
  // the "v1" prefix, since it's a plain static file, not an API route.
  app.use('/uploads', express.static(UPLOADS_DIR));

  const config = new DocumentBuilder()
    .setTitle('Central Mine APIs')
    .setDescription('The Central Mine Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { docExpansion: 'none' },
  });

  app.listen(configService.getPort(), () =>
    winstonLogger.log(
      `Central Mine API is Listening on Port: ${configService.getPort()}`,
    ),
  );
}

bootstrap();
