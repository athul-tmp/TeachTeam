import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Lecturer } from "./Lecturer";
import { Course } from "./Course";

// Reference: Based on Week 9 Lecture code

@Entity()
export class LecturerCourse {
  @PrimaryColumn()
  lecturerID: number;

  @PrimaryColumn()
  courseID: number;

  @ManyToOne(() => Lecturer, (lecturer: Lecturer) => lecturer.lecturerCourses)
  @JoinColumn({ name: 'lecturerID' })
  lecturer: Lecturer;

  @ManyToOne(() => Course, (course: Course) => course.lecturerCourses)
  @JoinColumn({ name: 'courseID' })
  course: Course;
}
