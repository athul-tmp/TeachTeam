import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { AppliedCourse } from "./AppliedCourse";
import { SelectedCandidate } from "./SelectedCandidate";
import { Comment } from "./Comment";

// Reference: Based on Week 9 Lecture code

export enum Availability {
  PART_TIME = "part-time",
  FULL_TIME = "full-time",
}

@Entity()
export class Candidate {
  @PrimaryColumn()
  candidateID: number;

  @OneToOne(() => User, (user: User) => user.candidate)
  @JoinColumn({ name: "candidateID" })
  user: User;

  @Column({ type: "text", nullable: true })
  previousRoles: string;

  @Column({
    type: process.env.NODE_ENV === "test" ? "text" : "enum", 
    enum: Availability,
    nullable: true,
  })
  availability: Availability;

  @Column({ type: "text", nullable: true })
  skills: string;

  @Column({ type: "text", nullable: true })
  academicCredentials: string;

  @OneToMany(() => AppliedCourse, (ac: AppliedCourse) => ac.candidate)
  appliedCourses: AppliedCourse[];

  @OneToMany(() => SelectedCandidate, (sc: SelectedCandidate) => sc.candidate)
  selectedByLecturers: SelectedCandidate[];

  @OneToMany(() => Comment, (comment: Comment) => comment.candidate)
  comments: Comment[];
}
