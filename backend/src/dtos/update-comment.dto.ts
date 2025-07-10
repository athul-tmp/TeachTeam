import { IsInt, IsOptional, IsString } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
