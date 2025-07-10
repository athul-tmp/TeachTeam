import { IsEnum, IsInt } from "class-validator";
import { CourseRole } from "../entity/AppliedCourse";

// Reference: Based on Week 9 Lecture code

export class CreateAppliedCourseDto {
  @IsInt()
  candidateID: number;

  @IsInt()
  courseID: number;

  @IsEnum(CourseRole)
  role: CourseRole;
}
