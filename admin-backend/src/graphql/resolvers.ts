import { AppDataSource } from "../data-source";
import { Admin } from "../entity/Admin";
import { User } from "../entity/User";
import { Lecturer } from "../entity/Lecturer";
import { Candidate } from "../entity/Candidate";
import { Course } from "../entity/Course";
import { LecturerCourse } from "../entity/LecturerCourse";
import { SelectedCandidate } from "../entity/SelectedCandidate";
import { Availability } from "../entity/Candidate";
import { In } from "typeorm";
import argon2 from "argon2";

// Reference: Based on Week 10 tutorial code

const adminRepo = AppDataSource.getRepository(Admin);
const userRepo = AppDataSource.getRepository(User);
const lecturerRepo = AppDataSource.getRepository(Lecturer);
const candidateRepo = AppDataSource.getRepository(Candidate);
const courseRepo = AppDataSource.getRepository(Course);
const lecturerCourseRepo = AppDataSource.getRepository(LecturerCourse);
const selectedCandidateRepo = AppDataSource.getRepository(SelectedCandidate);

export const resolvers = {
  // Workaround to fix graphql not allowing hyphens
  // Reference: https://daily.dev/blog/graphql-field-resolver-essentials
  Candidate: {
    availability: (candidate: Candidate) => {
      const rawAvailability = candidate.availability;
      if (rawAvailability === "part-time") return "part_time";
      if (rawAvailability === "full-time") return "full_time";
      return null;
    },
  },
  Query: {
    // Returns courses along with candidates selected for each of them
    candidatesChosenByCourse: async () => {
      const courses = await courseRepo.find({
        relations: ["lecturerCourses", "lecturerCourses.lecturer", "lecturerCourses.lecturer.selectedCandidates", "lecturerCourses.lecturer.selectedCandidates.candidate", "lecturerCourses.lecturer.selectedCandidates.candidate.user"]
      });

      // Map each course to a list of selected candidates
      const data = courses.map(course => {
        const selectedCandidatesMap = new Map<number, Candidate>();

        course.lecturerCourses.forEach(lc => {
          lc.lecturer.selectedCandidates.forEach(sc => {
            selectedCandidatesMap.set(sc.candidate.candidateID, sc.candidate);
          });
        });
      
        return {
          ...course,
          selectedCandidates: Array.from(selectedCandidatesMap.values())
        };
      });

      return data;
    },

    // Returns candidates chosen in more than 3 courses
    candidatesWithMoreThanThreeSelections: async () => {
      const results = await selectedCandidateRepo
        .createQueryBuilder("sc")
        .innerJoin(LecturerCourse, "lc", "lc.lecturerID = sc.lecturerID")
        .select("sc.candidateID", "candidateID")
        .addSelect("COUNT(DISTINCT lc.courseID)", "courseCount")
        .groupBy("sc.candidateID")
        .having("COUNT(DISTINCT lc.courseID) > 3")
        .getRawMany();

      const ids = results.map(r => r.candidateID);
      return await candidateRepo.find({
        where: { candidateID: In(ids) },
        relations: ["user"]
      });
    },
    
    // Returns candidates not chosen
    candidatesWithNoSelections: async () => {
      const selected = await selectedCandidateRepo.find();
      const selectedIDs = new Set(selected.map(sc => sc.candidateID));
      const allCandidates = await candidateRepo.find({ relations: ["user"] });
      return allCandidates.filter(c => !selectedIDs.has(c.candidateID));
    },

    allLecturers: async () => {
      return await lecturerRepo.find({ relations: ["user", "lecturerCourses"] })
    },
    allCourses: async () => {
      return await courseRepo.find()
    },
    allCandidates: async () => {
      return await candidateRepo.find({ relations: ["user"] })
    },
    user: async (_: any, { userID }: { userID: number }) => {
      return await userRepo.findOne({ where: { userID } })
    },
  },

  Mutation: {
    assignLecturerToCourse: async (_: any, { lecturerID, courseID }: { lecturerID: number; courseID: number }) => {
      const newAssignment = lecturerCourseRepo.create({ lecturerID, courseID });
      await lecturerCourseRepo.save(newAssignment);
      return true;
    },

    addCourse: async (_: any, args: { code: string; name: string; semester: string }) => {
      const newCourse = courseRepo.create(args);
      return await courseRepo.save(newCourse);
    },

    updateCourse: async (_: any, { courseID, ...args }: { courseID: number; code?: string; name?: string; semester?: string }) => {
      await courseRepo.update(courseID, args);
      return await courseRepo.findOne({ where: { courseID } });
    },

    deleteCourse: async (_: any, { courseID }: { courseID: number }) => {
      await lecturerCourseRepo.delete({ courseID });
      const result = await courseRepo.delete(courseID);
      return result.affected !== 0;
    },

    blockCandidate: async (_: any, { userID }: { userID: number }) => {
      await userRepo.update(userID, { isBlocked: true });
      return true;
    },

    unblockCandidate: async (_: any, { userID }: { userID: number }) => {
      await userRepo.update(userID, { isBlocked: false });
      return true;
    },

    adminLogin: async (_: any, { username, password }: { username: string; password: string }) => {
      const admin = await adminRepo.findOne({ where: { username } });
      if (!admin) throw new Error("Invalid credentials");

      const isMatch = await argon2.verify(admin.password, password);
      if (!isMatch) throw new Error("Invalid credentials");

      return admin;
    },
  },
};