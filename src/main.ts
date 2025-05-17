import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn", "log"]
        : ["error", "warn", "log", "debug", "verbose"],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Horse Management API")
    .setDescription("API for managing horses and their owners")
    .setVersion("1.0")
    .addTag("horses")
    .addTag("owners")
    .addApiKey(
      {
        type: "apiKey",
        name: "x-user-role",
        in: "header",
        description: "User role for authorization. Possible values: admin, vet",
      },
      "role",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  // Register global exception filter
  // app.useGlobalFilters(new GlobalExceptionFilter());

  // Register global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422, // Unprocessable Entity for validation errors
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
