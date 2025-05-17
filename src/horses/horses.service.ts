import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import {
  CreateHorseDto,
  UpdateHorseDto,
  UpdateHorseHealthDto,
  HorseFilterDto,
} from "./dto/horses.dto";
import { OwnersService } from "@/owners/owners.service";
import { Horse } from "@prisma/client";

@Injectable()
export class HorsesService {
  constructor(
    private prisma: PrismaService,
    private ownersService: OwnersService,
  ) {}

  /**
   * Find horse by ID and throw NotFoundException if not found
   */
  private async findHorseOrThrow(id: number): Promise<Horse> {
    const horse = await this.prisma.horse.findUnique({
      where: { id },
    });

    if (!horse) {
      throw new NotFoundException(`Horse with ID ${id} not found`);
    }

    return horse;
  }

  async create(createHorseDto: CreateHorseDto): Promise<Horse> {
    const { owner, ...horseData } = createHorseDto;

    await this.ownersService.findOne(owner);

    const horse = await this.prisma.horse.create({
      data: {
        ...horseData,
        owner,
      },
    });

    return horse;
  }

  async findAll(filters: HorseFilterDto = {}): Promise<Horse[]> {
    const horses = await this.prisma.horse.findMany({
      where: filters,
    });

    return horses;
  }

  async findOne(id: number): Promise<Horse> {
    return await this.findHorseOrThrow(id);
  }

  async update(id: number, updateHorseDto: UpdateHorseDto): Promise<Horse> {
    const { owner, ...horseData } = updateHorseDto;

    // Verify horse exists
    await this.findHorseOrThrow(id);

    // If owner is provided, verify owner exists
    if (owner) {
      await this.ownersService.findOne(owner);
    }

    const horse = await this.prisma.horse.update({
      where: { id },
      data: {
        ...horseData,
        ...(owner && { owner }),
      },
    });

    return horse;
  }

  async updateHealth(
    id: number,
    updateHealthDto: UpdateHorseHealthDto,
  ): Promise<Horse> {
    await this.findHorseOrThrow(id);

    return await this.prisma.horse.update({
      where: { id },
      data: {
        healthStatus: updateHealthDto.healthStatus,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findHorseOrThrow(id);

    await this.prisma.horse.delete({
      where: { id },
    });
  }
}
