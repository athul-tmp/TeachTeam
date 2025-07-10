import { Request, Response } from "express";
import { LecturerCourse } from "../entity/LecturerCourse";
import { AppDataSource } from "../data-source";
import { Lecturer } from "../entity/Lecturer";
import { Course } from "../entity/Course";

/**
 * LecturerCourseController handles HTTP requests related to lecturer-course assignments
 * Provides CRUD operations for LecturerCourse entity
 * Reference: Based on Week 9 Lecture code
 */
export class LecturerCourseController {
  private lecturerCourseRepo = AppDataSource.getRepository(LecturerCourse);
  private lecturerRepo = AppDataSource.getRepository(Lecturer);
  private courseRepo = AppDataSource.getRepository(Course);

  // Get all lecturer-course assignments
  async getAll(req: Request, res: Response) {
    const lecturerCourses = await this.lecturerCourseRepo.find({
      relations: ["lecturer", "course"],
    });
    res.json(lecturerCourses);
  }

  // Get one lecturer-course assignment by lecturerID and courseID 
  async getOne(req: Request, res: Response) {
    const lecturerCourse = await this.lecturerCourseRepo.findOne({
      where: {
        lecturerID: parseInt(req.params.lecturerID),
        courseID: parseInt(req.params.courseID),
      },
      relations: ["lecturer", "course"],
    });
    if (!lecturerCourse) return res.status(404).json({ message: "LecturerCourse not found" });
    res.json(lecturerCourse);
  }

  // Create a new lecturer-course assignment
  async create(req: Request, res: Response) {
    const { lecturerID, courseID } = req.body;

    const lecturer = await this.lecturerRepo.findOneBy({ lecturerID });
    const course = await this.courseRepo.findOneBy({ courseID });

    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lecturerCourse = this.lecturerCourseRepo.create({
      lecturerID,
      courseID,
      lecturer,
      course,
    });

    try {
      await this.lecturerCourseRepo.save(lecturerCourse);
    } catch (error) {
      return res.status(500).json({ message: "Error saving LecturerCourse", error });
    }
    res.status(201).json(lecturerCourse);
  }

  // Delete a lecturer-course assignment
  async delete(req: Request, res: Response) {
    const lecturerCourse = await this.lecturerCourseRepo.findOne({
      where: {
        lecturerID: parseInt(req.params.lecturerID),
        courseID: parseInt(req.params.courseID),
      },
    });
    if (!lecturerCourse) return res.status(404).json({ message: "LecturerCourse not found" });

    await this.lecturerCourseRepo.remove(lecturerCourse);
    res.json({ message: "LecturerCourse deleted" });
  }
}
