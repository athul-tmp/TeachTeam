import { Request, Response } from "express";
import { Candidate } from "../entity/Candidate";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

/**
 * CandidateController handles HTTP requests related to candidate
 * Provides CRUD operations for the Candidate entity
 * Reference: Based on Week 9 Lecture code
 */
export class CandidateController {
  private candidateRepo = AppDataSource.getRepository(Candidate);
  private userRepo = AppDataSource.getRepository(User);

  //Get all candidates
  async getAll(req: Request, res: Response) {
    const candidates = await this.candidateRepo.find({
      relations: ["user", "appliedCourses", "selectedByLecturers", "comments"],
    });
    res.json(candidates);
  }

  // Get one candidate by candidateID 
  async getOne(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
      relations: ["user", "appliedCourses", "selectedByLecturers", "comments"],
    });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  }

  // Create a new candidate 
  async create(req: Request, res: Response) {
    const { candidateID, previousRoles, availability, skills, academicCredentials, userID } = req.body;

    const user = await this.userRepo.findOne({ where: { userID } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const candidate = this.candidateRepo.create({
      candidateID,
      previousRoles,
      availability,
      skills,
      academicCredentials,
      user,
    });

    try {
      await this.candidateRepo.save(candidate);
    } catch (error) {
      return res.status(500).json({ message: "Error saving Candidate", error });
    }

    res.status(201).json(candidate);
  }

  // Update an existing candidate 
  async update(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
    });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const { previousRoles, availability, skills, academicCredentials } = req.body;

    if (previousRoles !== undefined) candidate.previousRoles = previousRoles;
    if (availability !== undefined) candidate.availability = availability;
    if (skills !== undefined) candidate.skills = skills;
    if (academicCredentials !== undefined) candidate.academicCredentials = academicCredentials;
    
    try {
      await this.candidateRepo.save(candidate);
    } catch (error) {
      return res.status(500).json({ message: "Error updating Candidate", error });
    }

    res.json(candidate);
  }

  // Delete an existing candidate 
  async delete(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
    });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    await this.candidateRepo.remove(candidate);
    res.json({ message: "Candidate deleted" });
  }

  // Get applied courses of a candidate
  async getAppliedCourses(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
      relations: ["appliedCourses", "appliedCourses.course"],
    });

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate.appliedCourses);
  }

  // Get selected candidates by lecturers 
  async getSelectedByLecturers(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
      relations: ["selectedByLecturers", "selectedByLecturers.lecturer"],
    });

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate.selectedByLecturers);
  }

  // Get comments made on a candidate
  async getComments(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
      relations: ["comments", "comments.lecturer"],
    });

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate.comments);
  }
}
