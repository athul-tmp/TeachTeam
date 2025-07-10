import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
} from "typeorm";
import { Candidate } from "./Candidate";
import { Lecturer } from "./Lecturer";

// Reference: Based on Week 9 Lecture code

export enum UserRole {
  CANDIDATE = 'candidate',
  LECTURER = 'lecturer',
}
  
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userID: number;

  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
      type: 'enum',
      enum: UserRole
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @OneToOne(() => Candidate, (candidate: Candidate) => candidate.user)
  candidate: Candidate;

  @OneToOne(() => Lecturer, (lecturer: Lecturer)=> lecturer.user)
  lecturer: Lecturer;
}
  