import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { LecturerCourse } from "./LecturerCourse";
import { AppliedCourse } from "./AppliedCourse";

// Reference: Based on Week 9 Lecture code

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  courseID: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  semester: string;

  @OneToMany(() => LecturerCourse, (lc: LecturerCourse) => lc.course)
  lecturerCourses: LecturerCourse[];

  @OneToMany(() => AppliedCourse, (ac: AppliedCourse) => ac.course)
  appliedCourses: AppliedCourse[];
}
