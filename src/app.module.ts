import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "./config/logger.config";
import { HorsesModule } from "./horses/horses.module";
import { OwnersModule } from "./owners/owners.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    HorsesModule,
    OwnersModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
