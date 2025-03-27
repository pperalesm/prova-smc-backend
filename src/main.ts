import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ConfigService } from "@nestjs/config";
import {
  CORS_CREDENTIALS,
  FRONTEND_URL_VAR,
  PORT_VAR,
  VALIDATION_PIPE_TRANSFORM,
  VALIDATION_PIPE_WHITELIST,
} from "./app.constants";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    credentials: CORS_CREDENTIALS,
    origin: configService.getOrThrow(FRONTEND_URL_VAR),
  });

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: VALIDATION_PIPE_WHITELIST,
      transform: VALIDATION_PIPE_TRANSFORM,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(configService.getOrThrow(PORT_VAR));
}

bootstrap();
