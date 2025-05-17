import { IsString, IsEmail, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PartialType } from "@nestjs/mapped-types";

export class CreateOwnerDto {
  @ApiProperty({
    description: "The name of the owner",
    example: "John Doe",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The email address of the owner",
    example: "john.doe@example.com",
  })
  @IsEmail()
  email: string;
}

export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {}
