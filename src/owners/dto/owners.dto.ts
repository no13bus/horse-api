import { IsString, IsEmail } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

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
