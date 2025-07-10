import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { LecturerCourse } from "./LecturerCourse";
import { SelectedCandidate } from "./SelectedCandidate";
import { Comment } from "./Comment";

// Reference: Based on Week 9 Lecture code

@Entity()
export class Lecturer {
  @PrimaryColumn()
  lecturerID: number;

  @OneToOne(() => User, (user: User) => user.lecturer)
  @JoinColumn({ name: 'lecturerID' })
  user: User;

  @OneToMany(() => LecturerCourse, (lc: LecturerCourse) => lc.lecturer, { nullable: true })
  lecturerCourses: LecturerCourse[];

  @OneToMany(() => SelectedCandidate, (sc: SelectedCandidate) => sc.lecturer, { nullable: true })
  selectedCandidates: SelectedCandidate[];

  @OneToMany(() => Comment, (comment: Comment) => comment.lecturer, { nullable: true })
  comments: Comment[];
}
