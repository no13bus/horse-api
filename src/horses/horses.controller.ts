import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { HorsesService } from "./horses.service";
import {
  CreateHorseDto,
  UpdateHorseDto,
  UpdateHorseHealthDto,
  HorseFilterDto,
} from "./dto/horses.dto";
import { Roles } from "@/decorators/roles.decorator";
import { RolesGuard } from "@/guards/roles.guard";
import { UserRole } from "@/common/enums/role.enum";
import { Horse } from "@prisma/client";

@ApiTags("horses")
@Controller("api/v1/horses")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@ApiSecurity("role")
export class HorsesController {
  constructor(private readonly horsesService: HorsesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new horse" })
  async create(@Body() createHorseDto: CreateHorseDto): Promise<Horse> {
    return this.horsesService.create(createHorseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VET)
  @ApiOperation({ summary: "Get all horses with optional filters" })
  async findAll(@Query() filters: HorseFilterDto): Promise<Horse[]> {
    return this.horsesService.findAll(filters);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.VET)
  @ApiOperation({ summary: "Get a horse by id" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Horse> {
    return this.horsesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a horse" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateHorseDto: UpdateHorseDto,
  ): Promise<Horse> {
    return this.horsesService.update(id, updateHorseDto);
  }

  @Patch(":id/health")
  @Roles(UserRole.ADMIN, UserRole.VET)
  @ApiOperation({ summary: "Update horse health status" })
  async updateHealth(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateHealthDto: UpdateHorseHealthDto,
  ): Promise<Horse> {
    return this.horsesService.updateHealth(id, updateHealthDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a horse" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.horsesService.remove(id);
  }
}
