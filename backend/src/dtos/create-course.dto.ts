import { IsNotEmpty } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class CreateCourseDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  semester: string;
}
