import { Module } from '@nestjs/common';
import { HorsesController } from './horses.controller';
import { HorsesService } from './horses.service';
import { OwnersModule } from '../owners/owners.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [OwnersModule, PrismaModule],
  controllers: [HorsesController],
  providers: [HorsesService],
  exports: [HorsesService],
})
export class HorsesModule {} 