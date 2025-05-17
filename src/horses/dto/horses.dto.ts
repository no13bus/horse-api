import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from "class-validator";
import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { HealthStatus } from "@/common/enums/health-status.enum";
import { Type } from "class-transformer";

export class HorseFilterDto {
  @IsOptional()
  @ApiProperty({ required: false, example: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  age?: number;

  @IsOptional()
  @ApiProperty({ required: false, example: "Arabian" })
  @IsString()
  breed?: string;

  @IsOptional()
  @ApiProperty({ required: false, enum: HealthStatus })
  @IsEnum(HealthStatus)
  healthStatus?: HealthStatus;
}

export class CreateHorseDto {
  @ApiProperty({ example: "Spirit" })
  @IsString()
  name: string;

  @ApiProperty({ example: 5, description: "Horse age (1-30 years)" })
  @IsNumber()
  @Min(1, { message: "Horse must be at least 1 year old" })
  @Max(30, { message: "Age cannot exceed 30 years" })
  age: number;

  @ApiProperty({ example: "Arabian" })
  @IsString()
  breed: string;

  @ApiProperty({ enum: HealthStatus, example: HealthStatus.HEALTHY })
  @IsEnum(HealthStatus)
  healthStatus: HealthStatus;

  @ApiProperty({ example: 1, description: "ID of the owner" })
  @IsNumber()
  owner: number;
}

export class UpdateHorseDto extends PartialType(CreateHorseDto) {}

export class UpdateHorseHealthDto extends PickType(CreateHorseDto, ['healthStatus'] as const) {}

