import { IsInt } from "class-validator";

// Reference: Based on Week 9 Lecture code

export class CreateSelectedCandidateDto {
  @IsInt()
  lecturerID: number;

  @IsInt()
  candidateID: number;

  @IsInt()
  preferenceRanking: number;
}
