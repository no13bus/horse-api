import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { HealthStatus } from '../../common/enums/health-status.enum';

export type HorseFilter = Partial<{
  age: number;
  breed: string;
  healthStatus: HealthStatus;
}>;

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

export class UpdateHorseHealthDto {
  @ApiProperty({ enum: HealthStatus, example: HealthStatus.HEALTHY })
  @IsEnum(HealthStatus)
  healthStatus: HealthStatus;
}
