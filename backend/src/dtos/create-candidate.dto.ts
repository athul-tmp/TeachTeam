import { IsEnum, IsOptional, IsString } from "class-validator";
import { Availability } from "../entity/Candidate";

// Reference: Based on Week 9 Lecture code

export class CreateCandidateDto {
  @IsOptional()
  @IsString()
  previousRoles?: string;

  @IsOptional()
  @IsEnum(Availability)
  availability: Availability;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  academicCredentials?: string;
}
