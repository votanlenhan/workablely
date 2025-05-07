import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as pg from 'pg'; // Added import for pg

// --- PG Type Parser Configuration ---
// Ensure DECIMAL and NUMERIC types are parsed as numbers
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, (value: string) => {
  return parseFloat(value);
});
// const PG_NUMERIC_OID = 1700; // Same as DECIMAL, but can be explicit if other OIDs are used
// pg.types.setTypeParser(PG_NUMERIC_OID, parseFloat);
// --- End PG Type Parser Configuration ---

async function bootstrap() {
  console.log('[main.ts] Bootstrapping application...'); // LOG START
  const app = await NestFactory.create(AppModule);
  console.log('[main.ts] Nest application created.'); // LOG AFTER CREATE

  app.setGlobalPrefix('api'); // Add global prefix

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Swagger Setup (OpenAPI documentation)
  const config = new DocumentBuilder()
    .setTitle('Photographer Management API')
    .setDescription('API documentation for the photographer management system')
    .setVersion('1.0')
    .addBearerAuth() // If using JWT Bearer auth
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[main.ts] Application is running on: ${await app.getUrl()}`); // LOG END
}
bootstrap();
