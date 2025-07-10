import { Request, Response } from "express";
import { SelectedCandidate } from "../entity/SelectedCandidate";
import { AppDataSource } from "../data-source";
import { Lecturer } from "../entity/Lecturer";
import { Candidate } from "../entity/Candidate";

/**
 * SelectedCandidateController handles HTTP requests related to selected candidates
 * Provides CRUD operations for SelectedCandidate entity
 * Reference: Based on Week 9 Lecture code
 */
export class SelectedCandidateController {
  private selectedCandidateRepo = AppDataSource.getRepository(SelectedCandidate);
  private lecturerRepo = AppDataSource.getRepository(Lecturer);
  private candidateRepo = AppDataSource.getRepository(Candidate);

  // Get all selected candidates 
  async getAll(req: Request, res: Response) {
    const selectedCandidates = await this.selectedCandidateRepo.find({
      relations: ["lecturer", "candidate"],
    });
    res.json(selectedCandidates);
  }

  // Get one selected candidate by lecturerID and candidateID 
  async getOne(req: Request, res: Response) {
    const selectedCandidate = await this.selectedCandidateRepo.findOne({
      where: {
        lecturerID: parseInt(req.params.lecturerID),
        candidateID: parseInt(req.params.candidateID),
      },
      relations: ["lecturer", "candidate"],
    });
    if (!selectedCandidate) return res.status(404).json({ message: "SelectedCandidate not found" });
    res.json(selectedCandidate);
  }

  // Create a new selected candidate
  async create(req: Request, res: Response) {
    const { lecturerID, candidateID, preferenceRanking } = req.body;
    const repo = AppDataSource.getRepository(SelectedCandidate);
    const existing = await repo.findOne({
      where: { lecturerID, candidateID }
    });

    if (existing) {
      return res.status(409).json({ message: "Candidate already selected" });
    }
    const selected = repo.create({ lecturerID, candidateID, preferenceRanking });
    try {
      await repo.save(selected);
      return res.status(201).json(selected);
    } catch (err) {
      return res.status(500).json({ message: "Error saving selection", error: err });
    }
  }

  // Update an existing selected candidate's ranking
  async update(req: Request, res: Response) {
    const selectedCandidate = await this.selectedCandidateRepo.findOne({
      where: {
        lecturerID: parseInt(req.params.lecturerID),
        candidateID: parseInt(req.params.candidateID),
      },
    });
  
    if (!selectedCandidate) {
      return res.status(404).json({ message: "SelectedCandidate not found" });
    }
  
    const { preferenceRanking } = req.body;
  
    if (preferenceRanking !== undefined) {
      selectedCandidate.preferenceRanking = preferenceRanking;
    }
  
    try {
      await this.selectedCandidateRepo.save(selectedCandidate);
    } catch (error) {
      return res.status(500).json({ message: "Error updating SelectedCandidate", error });
    }
  
    res.json(selectedCandidate);
  }

  // Delete a selected candidate 
  async delete(req: Request, res: Response) {
    const selectedCandidate = await this.selectedCandidateRepo.findOne({
      where: {
        lecturerID: parseInt(req.params.lecturerID),
        candidateID: parseInt(req.params.candidateID),
      },
    });
    if (!selectedCandidate) return res.status(404).json({ message: "SelectedCandidate not found" });

    await this.selectedCandidateRepo.remove(selectedCandidate);
    res.json({ message: "SelectedCandidate deleted" });
  }

  // Count times each candidate was selected
  // Reference: https://typeorm.io/select-query-builder
  async getCandidateSelectionCounts(req: Request, res: Response) {
    try {
      const counts = await this.selectedCandidateRepo
        .createQueryBuilder("sc")
        .select("sc.candidateID", "candidateID")
        .addSelect("COUNT(*)", "selectedcount")
        .groupBy("sc.candidateID")
        .getRawMany(); // returns: [{ candidateID: "1", selectedcount: "2" }, ...]

      // convert selectedcount to number
      const result = counts.map(row => ({
        candidateID: row.candidateID,
        selectedcount: parseInt(row.selectedcount, 10)
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Error fetching selection counts", error: err });
    }
  }
}
