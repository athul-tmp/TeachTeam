import { Request, Response } from "express";
import { AppliedCourse, CourseRole } from "../entity/AppliedCourse";
import { AppDataSource } from "../data-source";
import { Candidate } from "../entity/Candidate";
import { Course } from "../entity/Course";

/**
 * AppliedCourseController handles HTTP requests related to applied course
 * Provides CRUD operations for the AppliedCourse entity
 * Reference: Based on Week 9 Lecture code
 */
export class AppliedCourseController {
  private appliedCourseRepo = AppDataSource.getRepository(AppliedCourse);
  private candidateRepo = AppDataSource.getRepository(Candidate);
  private courseRepo = AppDataSource.getRepository(Course);

  // Get all applied courses
  async getAll(req: Request, res: Response) {
    const appliedCourses = await this.appliedCourseRepo.find({
      relations: ["candidate", "course"],
    });
    res.json(appliedCourses);
  }

  // Get one applied course by candidateID and courseID
  async getOne(req: Request, res: Response) {
    const role = req.params.role as CourseRole;
    const appliedCourse = await this.appliedCourseRepo.findOne({
      where: {
        candidateID: parseInt(req.params.candidateID),
        courseID: parseInt(req.params.courseID),
        role,
      },
      relations: ["candidate", "course"],
    });
    if (!appliedCourse) return res.status(404).json({ message: "Applied Course not found" });
    res.json(appliedCourse);
  }

  // Create a new applied course
  async create(req: Request, res: Response) {
    const { candidateID, courseID, role } = req.body;

    const candidate = await this.candidateRepo.findOne({ where: { candidateID } });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const course = await this.courseRepo.findOne({ where: { courseID } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await this.appliedCourseRepo.findOne({ where: { candidateID, courseID, role } });
    if (existing) return res.status(409).json({ message: "Applied Course already exists" });

    const appliedCourse = this.appliedCourseRepo.create({
      candidateID,
      courseID,
      role,
      candidate,
      course,
    });

    try {
      await this.appliedCourseRepo.save(appliedCourse);
      res.status(201).json(appliedCourse);
    } catch (error) {
      res.status(500).json({ message: "Error saving Applied Course", error });
    }
  }

  // Delete an applied course 
  async delete(req: Request, res: Response) {
    const role = req.params.role as CourseRole;
    const appliedCourse = await this.appliedCourseRepo.findOne({
      where: {
        candidateID: parseInt(req.params.candidateID),
        courseID: parseInt(req.params.courseID),
        role,
      },
    });
    if (!appliedCourse) return res.status(404).json({ message: "Applied Course not found" });

    await this.appliedCourseRepo.remove(appliedCourse);
    res.json({ message: "Applied Course deleted" });
  }
}
