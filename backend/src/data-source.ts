import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

import { User } from "./entity/User";
import { Candidate } from "./entity/Candidate";
import { Lecturer } from "./entity/Lecturer";
import { Course } from "./entity/Course";
import { SelectedCandidate } from "./entity/SelectedCandidate";
import { Comment } from "./entity/Comment";
import { AppliedCourse } from "./entity/AppliedCourse";
import { LecturerCourse } from "./entity/LecturerCourse";

// Reference: Based on Week 10 Lecture code

const isTesting = process.env.NODE_ENV === "test";

const sqliteConfig: DataSourceOptions = {
  type: "sqlite",
  database: isTesting ? ":memory:" : "database.sqlite",
  entities: [User , Candidate, Lecturer ,Course ,  SelectedCandidate, Comment, AppliedCourse,  LecturerCourse],
  synchronize: true,
  logging: false,
};





// Reference: Based on Week 9 Lecture code

const  mysqlConfig: DataSourceOptions = {
  type: "mysql",
  host: "",
  port: "",
  username: "",
  password: "",
  database: "",
  synchronize: true,
  logging: true,
  entities: [User, Candidate, Lecturer, Course, SelectedCandidate, Comment, AppliedCourse, LecturerCourse],
  migrations: [],
  subscribers: [],
};




export const AppDataSource = new DataSource(
  isTesting ? sqliteConfig : mysqlConfig
);