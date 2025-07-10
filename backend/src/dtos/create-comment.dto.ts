import { IsInt, IsNotEmpty } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class CreateCommentDto {
  @IsInt()
  lecturerID: number;

  @IsInt()
  candidateID: number;

  @IsNotEmpty()
  content: string;
}
