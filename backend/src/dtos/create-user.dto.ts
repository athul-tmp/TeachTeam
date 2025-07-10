import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { UserRole } from "../entity/User";

// Reference: Based on Week 9 Lecture code

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
  
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
