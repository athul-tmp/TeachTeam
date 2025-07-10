import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../entity/User";

// Reference: Based on Week 9 Lecture code

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
  
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
