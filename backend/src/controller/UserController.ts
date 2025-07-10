import { Request, Response } from "express";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Candidate } from "../entity/Candidate";
import { Lecturer } from "../entity/Lecturer";
import argon2 from "argon2";

/**
 * UserController handles HTTP requests related to users.
 * Provides CRUD operations for the User entity.
 */
export class UserController {
  private userRepo = AppDataSource.getRepository(User);
  private candidateRepo = AppDataSource.getRepository(Candidate);
  private lecturerRepo = AppDataSource.getRepository(Lecturer);

  // Get all users
  async getAll(req: Request, res: Response) {
    const users = await this.userRepo.find({
      relations: ["candidate", "lecturer"],
    });
    res.json(users);
  }

  // Get one user by ID
  async getOne(req: Request, res: Response) {
    const user = await this.userRepo.findOne({
      where: { userID: parseInt(req.params.userID) },
      relations: ["candidate", "lecturer"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  }

  // Create new user
  async create(req: Request, res: Response) {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await this.userRepo.findOneBy({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    try {
      const hashedPassword = await argon2.hash(password); 
      const user = this.userRepo.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });
      await this.userRepo.save(user);
      if (role === "candidate") {
        const candidate = this.candidateRepo.create({ user });
        await this.candidateRepo.save(candidate);
      } else if (role === "lecturer") {
        const lecturer = this.lecturerRepo.create({ user });
        await this.lecturerRepo.save(lecturer);
      }
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error saving user", error });
    }
  }

  // Update existing user
  async update(req: Request, res: Response) {
    const user = await this.userRepo.findOneBy({
      userID: parseInt(req.params.userID),
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, role, email, password } = req.body;

    if (email) user.email = email;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;

    try {
      await this.userRepo.save(user);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  }

  // Delete a user
  async delete(req: Request, res: Response) {
    const user = await this.userRepo.findOneBy({
      userID: parseInt(req.params.userID),
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    await this.userRepo.remove(user);
    res.json({ message: "User deleted" });
  }

  // Login user
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ["candidate", "lecturer"],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact admin." });
    }
    res.json(user);
  }

}
