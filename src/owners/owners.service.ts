import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOwnerDto, UpdateOwnerDto } from "./dto/owners.dto";
import { Owner } from "@prisma/client";

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find owner by email
   */
  private async findOwnerByEmail(email: string): Promise<Owner | null> {
    return await this.prisma.owner.findUnique({
      where: { email },
    });
  }

  /**
   * Find owner by ID or throw NotFoundException
   */
  private async findOwnerOrThrow(id: number): Promise<Owner> {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }

    return owner;
  }

  async create(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const existingOwner = await this.findOwnerByEmail(createOwnerDto.email);
    if (existingOwner) {
      throw new BadRequestException(
        `Email ${createOwnerDto.email} is already registered`,
      );
    }

    return await this.prisma.owner.create({
      data: createOwnerDto,
    });
  }

  async findAll(): Promise<Owner[]> {
    return this.prisma.owner.findMany({});
  }

  async findOne(id: number): Promise<Owner> {
    return this.findOwnerOrThrow(id);
  }

  async update(id: number, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    // Check if owner exists
    await this.findOwnerOrThrow(id);

    // If email is being updated, check if it's already used
    if (updateOwnerDto.email) {
      const existingOwner = await this.findOwnerByEmail(updateOwnerDto.email);
      if (existingOwner) {
        throw new BadRequestException(
          `Email ${updateOwnerDto.email} is already registered`,
        );
      }
    }

    return this.prisma.owner.update({
      where: { id },
      data: updateOwnerDto,
    });
  }

  async remove(id: number): Promise<void> {
    // Check if owner exists
    await this.findOwnerOrThrow(id);

    // Delete the owner. Due to the foreign key constraint with CASCADE option,
    // all horses belonging to this owner will be automatically deleted from the database
    await this.prisma.owner.delete({
      where: { id },
    });
  }
}
