import { IsOptional, IsString } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  semester?: string;
}
