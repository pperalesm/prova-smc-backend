import { Global, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from "@nestjs/throttler";
import { TerminusModule } from "@nestjs/terminus";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { APP_GUARD } from "@nestjs/core";
import { HealthController } from "./health.controller";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  LOGGER_MIDDLEWARE_ROUTES,
  COOKIE_PARSER_MIDDLEWARE_ROUTES,
  HELMET_MIDDLEWARE_ROUTES,
  NODE_ENV_VAR,
  PRODUCTION_ENV,
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from "./app.constants";
import { LocationModule } from "./modules/location/location.module";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers:
          configService.getOrThrow(NODE_ENV_VAR) === PRODUCTION_ENV
            ? [
                {
                  ttl: THROTTLER_TTL,
                  limit: THROTTLER_LIMIT,
                },
              ]
            : [],
      }),
    }),
    TerminusModule,
    LocationModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(LOGGER_MIDDLEWARE_ROUTES);
    consumer.apply(cookieParser()).forRoutes(COOKIE_PARSER_MIDDLEWARE_ROUTES);
    consumer.apply(helmet()).forRoutes(HELMET_MIDDLEWARE_ROUTES);
  }
}
