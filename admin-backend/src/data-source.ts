import "reflect-metadata";
import { DataSource } from "typeorm";

import { Admin } from "./entity/Admin";
import { User } from "./entity/User";
import { Candidate } from "./entity/Candidate";
import { Lecturer } from "./entity/Lecturer";
import { Course } from "./entity/Course";
import { SelectedCandidate } from "./entity/SelectedCandidate";
import { Comment } from "./entity/Comment";
import { AppliedCourse } from "./entity/AppliedCourse";
import { LecturerCourse } from "./entity/LecturerCourse";

export const AppDataSource = new DataSource({
  type: "",
  host: "",
  port: "",
  username: "",
  password: "",
  database: "",
  synchronize: true,
  logging: true,
  entities: [Admin, User, Candidate, Lecturer, Course, Comment, SelectedCandidate, AppliedCourse, LecturerCourse],
  migrations: [],
  subscribers: [],
});
