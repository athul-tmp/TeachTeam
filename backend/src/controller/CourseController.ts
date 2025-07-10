import { Request, Response } from "express";
import { Course } from "../entity/Course";
import { AppDataSource } from "../data-source";

/**
 * CourseController handles HTTP requests related to courses
 * Provides CRUD operations for course entity
 * Reference: Based on Week 9 Lecture code
 */
export class CourseController {
  private courseRepo = AppDataSource.getRepository(Course);

  // Get all courses
  async getAll(req: Request, res: Response) {
    const courses = await this.courseRepo.find();
    res.json(courses);
  }

  // Get one course by ID
  async getOne(req: Request, res: Response) {
    const course = await this.courseRepo.findOne({
      where: { courseID: parseInt(req.params.courseID) },
      relations: ["lecturerCourses", "appliedCourses"],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  }

  // Create a new course
  async create(req: Request, res: Response) {
    const course = this.courseRepo.create(req.body);
    try {
      await this.courseRepo.save(course);
    } catch (error) {
      return res.status(500).json({ message: "Error saving Course", error });
    }
    res.status(201).json(course);
  }

  // Update an existing course
  async update(req: Request, res: Response) {
    let course = await this.courseRepo.findOne({
      where: { courseID: parseInt(req.params.courseID) },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    this.courseRepo.merge(course, req.body);
    try {
      await this.courseRepo.save(course);
    } catch (error) {
      return res.status(500).json({ message: "Error updating Course", error });
    }
    res.json(course);
  }

  // Delete a course
  async delete(req: Request, res: Response) {
    const course = await this.courseRepo.findOne({
      where: { courseID: parseInt(req.params.courseID) },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    await this.courseRepo.remove(course);
    res.json({ message: "Course deleted" });
  }

  // Get all lecturers teaching a specific course
  async getLecturerCourses(req: Request, res: Response) {
    const course = await this.courseRepo.findOne({
      where: { courseID: parseInt(req.params.courseID) },
      relations: ["lecturerCourses"],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.lecturerCourses);
  }

  // Get all candidates applied for a specific course
  async getAppliedCourses(req: Request, res: Response) {
    const course = await this.courseRepo.findOne({
      where: { courseID: parseInt(req.params.courseID) },
      relations: ["appliedCourses", "appliedCourses.candidate", "appliedCourses.candidate.user"],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course.appliedCourses);
  }

}
