import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { OwnersService } from "./owners.service";
import { CreateOwnerDto, UpdateOwnerDto } from "./dto/owners.dto";
import { RolesGuard } from "@/guards/roles.guard";
import { Roles } from "@/decorators/roles.decorator";
import { UserRole } from "@/common/enums/role.enum";
import { Owner } from "@prisma/client";

@ApiTags("owners")
@Controller("api/v1/owners")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@ApiSecurity("role")
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new owner" })
  async create(@Body() createOwnerDto: CreateOwnerDto): Promise<Owner> {
    return this.ownersService.create(createOwnerDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VET)
  @ApiOperation({ summary: "Get all owners" })
  async findAll(): Promise<Owner[]> {
    return this.ownersService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.VET)
  @ApiOperation({ summary: "Get an owner by id" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Owner> {
    return this.ownersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an owner" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ): Promise<Owner> {
    return this.ownersService.update(id, updateOwnerDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an owner" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.ownersService.remove(id);
  }
}
