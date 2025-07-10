import { Request, Response } from "express";
import { Lecturer } from "../entity/Lecturer";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

/**
 * LecturerController handles HTTP requests related to lecturers
 * Provides CRUD operations for Lecturer entity
 * Reference: Based on Week 9 Lecture code
 */
export class LecturerController {
  private lecturerRepo = AppDataSource.getRepository(Lecturer);
  private userRepo = AppDataSource.getRepository(User);

  // Get all lecturers 
  async getAll(req: Request, res: Response) {
    const lecturers = await this.lecturerRepo.find({
      relations: ["user", "lecturerCourses", "selectedCandidates", "comments"],
    });
    res.json(lecturers);
  }

  // Get one lecturer by lecturerID
  async getOne(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
      relations: ["user", "lecturerCourses", "selectedCandidates", "comments", "comments.candidate", "comments.lecturer", "comments.lecturer.user"],
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });
    res.json(lecturer);
  }

  // Create a new lecturer 
  async create(req: Request, res: Response) {
    const { lecturerID, userID } = req.body;
    const user = await this.userRepo.findOneBy({ userID });

    if (!user) return res.status(404).json({ message: "User not found" });

    const lecturer = this.lecturerRepo.create({
      lecturerID,
      user,
    });

    try {
      await this.lecturerRepo.save(lecturer);
    } catch (error) {
      return res.status(500).json({ message: "Error saving Lecturer", error });
    }
    res.status(201).json(lecturer);
  }

  // Delete a lecturer
  async delete(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    await this.lecturerRepo.remove(lecturer);
    res.json({ message: "Lecturer deleted" });
  }

  // Get all courses taught by a specific lecturer 
  async getCourses(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
      relations: ["lecturerCourses"],
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    res.json(lecturer.lecturerCourses);
  }

  // Get all selected candidates for a specific lecturer
  async getSelectedCandidates(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
      relations: ["selectedCandidates"],
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    res.json(lecturer.selectedCandidates);
  }

  // Get all comments by a specific lecturer 
  async getComments(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
      relations: ["comments"],
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    res.json(lecturer.comments);
  }

  // Get filtered applicants
  // Reference: https://typeorm.io/select-query-builder
  async getFilteredApplicants(req: Request, res: Response) {
    const lecturerID = parseInt(req.params.lecturerID);
    const { courseID, role, availability, skill, name, sortBy, order } = req.query;

    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID },
      relations: ["lecturerCourses"],
    });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    // Get course id of courses taught by current lecturer
    const taughtCourseIDs = lecturer.lecturerCourses.map(lc => lc.courseID);

    // Query to get applicants based on courses taught by lecturer, along with filter criterias passed along
    const appliedQuery = AppDataSource.getRepository("AppliedCourse")
      .createQueryBuilder("ac")
      .leftJoinAndSelect("ac.candidate", "candidate")
      .leftJoinAndSelect("candidate.user", "user")
      .leftJoinAndSelect("ac.course", "course")
      .where("ac.courseID IN (:...courseIDs)", { courseIDs: taughtCourseIDs });

    // Filters
    if (courseID) appliedQuery.andWhere("ac.courseID = :courseID", { courseID });
    if (role) appliedQuery.andWhere("ac.role = :role", { role });
    if (availability) appliedQuery.andWhere("candidate.availability = :availability", { availability });
    if (skill) appliedQuery.andWhere("LOWER(candidate.skills) LIKE :skill", { skill: `%${(skill as string).toLowerCase()}%` });
    if (name) appliedQuery.andWhere("LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :name", {name: `%${(name as string).toLowerCase()}%`});

    // Sort
    if (sortBy === "course") {
      appliedQuery.orderBy("BINARY course.name", order === "desc" ? "DESC" : "ASC");
    } else if (sortBy === "availability") {
      appliedQuery.orderBy("BINARY candidate.availability", order === "desc" ? "DESC" : "ASC");
    }
    const appliedCourses = await appliedQuery.getMany();
    res.json(appliedCourses);

  }
}
