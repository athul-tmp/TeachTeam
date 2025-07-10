import { IsInt } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class CreateLecturerCourseDto {
  @IsInt()
  lecturerID: number;

  @IsInt()
  courseID: number;
}
