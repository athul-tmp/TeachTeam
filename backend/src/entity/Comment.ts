import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { Lecturer } from "./Lecturer";
import { Candidate } from "./Candidate";

// Reference: Based on Week 9 Lecture code

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  commentID: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({type: 'text'})
  content: string;

  @ManyToOne(() => Candidate, (candidate: Candidate) => candidate.comments)
  @JoinColumn({ name: 'candidateID' })
  candidate: Candidate;

  @ManyToOne(() => Lecturer, (lecturer: Lecturer) => lecturer.comments)
  @JoinColumn({ name: 'lecturerID' })
  lecturer: Lecturer;
}
