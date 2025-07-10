import { IsInt } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class CreateLecturerDto {
  @IsInt()
  lecturerID: number;
}
