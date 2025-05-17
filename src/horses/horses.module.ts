import { Module } from "@nestjs/common";
import { HorsesController } from "./horses.controller";
import { HorsesService } from "./horses.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { OwnersModule } from "@/owners/owners.module";

@Module({
  imports: [PrismaModule, OwnersModule],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {}
