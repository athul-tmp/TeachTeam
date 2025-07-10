import { Request, Response } from "express";
import { Comment } from "../entity/Comment";
import { AppDataSource } from "../data-source";
import { Candidate } from "../entity/Candidate";
import { Lecturer } from "../entity/Lecturer";

/**
 * CommentController handles HTTP requests related to comment.
 * Provides CRUD operations for the Comment entity.
 * Reference: Based on Week 9 Lecture code
 */
export class CommentController {
  private commentRepo = AppDataSource.getRepository(Comment);
  private candidateRepo = AppDataSource.getRepository(Candidate);
  private lecturerRepo = AppDataSource.getRepository(Lecturer);

  // Get all comments 
  async getAll(req: Request, res: Response) {
    const comments = await this.commentRepo.find({
      relations: ["candidate", "lecturer"],
    });
    res.json(comments);
  }

  // Get one comment by commentID 
  async getOne(req: Request, res: Response) {
    const comment = await this.commentRepo.findOne({
      where: { commentID: parseInt(req.params.commentID) },
      relations: ["candidate", "lecturer","lecturer.user"],
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  }

  // Create a new comment
  async create(req: Request, res: Response) {
    const { content, candidateID, lecturerID } = req.body;

    const candidate = await this.candidateRepo.findOne({ where: { candidateID } });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const lecturer = await this.lecturerRepo.findOne({ where: { lecturerID } });
    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });

    const comment = this.commentRepo.create({
      content,
      candidate,
      lecturer,
    });

    try {
      await this.commentRepo.save(comment);
      const fullComment = await this.commentRepo.findOne({
        where: { commentID: comment.commentID },
        relations: ["candidate", "lecturer", "lecturer.user"],
      });
      res.status(201).json(fullComment);
    } catch (error) {
      return res.status(500).json({ message: "Error saving Comment", error });
    }    
  }

  // Update an existing comment
  async update(req: Request, res: Response) {
    const comment = await this.commentRepo.findOne({
      where: { commentID: parseInt(req.params.commentID) },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const { content } = req.body;

    if (content) comment.content = content;

    try {
      await this.commentRepo.save(comment);
    } catch (error) {
      return res.status(500).json({ message: "Error updating Comment", error });
    }

    res.json(comment);
  }

  // Delete an existing comment
  async delete(req: Request, res: Response) {
    const comment = await this.commentRepo.findOne({
      where: { commentID: parseInt(req.params.commentID) },
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await this.commentRepo.remove(comment);
    res.json({ message: "Comment deleted" });
  }

  // Get comments for a specific candidate 
  async getCommentsForCandidate(req: Request, res: Response) {
    const candidate = await this.candidateRepo.findOne({
      where: { candidateID: parseInt(req.params.candidateID) },
      relations: ["comments", "comments.lecturer", "comments.lecturer.user", "comments.candidate"],
    });

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate.comments);
  }

  // Get comments for a specific lecturer 
  async getCommentsForLecturer(req: Request, res: Response) {
    const lecturer = await this.lecturerRepo.findOne({
      where: { lecturerID: parseInt(req.params.lecturerID) },
      relations: ["comments", "comments.candidate"],
    });

    if (!lecturer) return res.status(404).json({ message: "Lecturer not found" });
    res.json(lecturer.comments);
  }
}
