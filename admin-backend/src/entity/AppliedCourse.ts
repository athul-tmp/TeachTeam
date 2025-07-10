import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Candidate } from "./Candidate";
import { Course } from "./Course";

// Reference: Based on Week 9 Lecture code

export enum CourseRole {
  TUTOR = 'tutor',
  LAB_ASSISTANT = 'lab_assistant',
}

@Entity()
export class AppliedCourse {
  @PrimaryColumn()
  candidateID: number;

  @PrimaryColumn()
  courseID: number;

  @PrimaryColumn({
    type: 'enum',
    enum: CourseRole,
  })
  role: CourseRole;

  @ManyToOne(() => Candidate, (candidate: Candidate) => candidate.appliedCourses)
  @JoinColumn({ name: 'candidateID' })
  candidate: Candidate;

  @ManyToOne(() => Course, (course: Course) => course.appliedCourses)
  @JoinColumn({ name: 'courseID' })
  course: Course;
}
