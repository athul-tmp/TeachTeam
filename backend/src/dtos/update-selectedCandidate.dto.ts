import { IsInt, IsOptional } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class UpdateSelectedCandidateDto {
  @IsOptional()
  @IsInt()
  preferenceRanking?: number;
}
