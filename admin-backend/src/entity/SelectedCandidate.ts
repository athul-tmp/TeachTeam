import {
  Entity,
  PrimaryColumn,
  Column,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Lecturer } from "./Lecturer";
import { Candidate } from "./Candidate";

// Reference: Based on Week 9 Lecture code

@Entity()
export class SelectedCandidate {
  @PrimaryColumn()
  lecturerID: number;

  @PrimaryColumn()
  candidateID: number;

  @Column()
  preferenceRanking: number;

  @ManyToOne(() => Lecturer, (lecturer: Lecturer) => lecturer.selectedCandidates)
  @JoinColumn({ name: 'lecturerID' })
  lecturer: Lecturer;

  @ManyToOne(() => Candidate, (candidate: Candidate) => candidate.selectedByLecturers)
  @JoinColumn({ name: 'candidateID' })
  candidate: Candidate;
}


