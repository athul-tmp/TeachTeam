import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Candidate } from "../../entity/Candidate";
import { User, UserRole } from "../../entity/User";
import { Availability } from "../../entity/Candidate";

// Reference: Based on Week 10 Lecture code

describe("Candidate Routes", () => {
  let userID: number;

  beforeEach(async () => {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const userRepo = AppDataSource.getRepository(User);

    await candidateRepo.clear();
    await userRepo.clear();

    // It Creates and store a user for linking candidate
    const user = userRepo.create({
      email: "Majid@gmail.com",
      password: "TestPass123",
      firstName: "Majid",
      lastName: "Candidate",
      role: UserRole.CANDIDATE,
    });
    const savedUser = await userRepo.save(user);
    userID = savedUser.userID;
  });

  // Test 1 - Successfully create a new candidate
  it("should create a new candidate", async () => {
    const newCandidate = {
      candidateID: userID,
      userID: userID,
      previousRoles: "Tutor",
      availability: Availability.FULL_TIME,
      skills: "JavaScript, Networking",
      academicCredentials: "BSc IT"
    };

    const res = await request(app).post("/api/candidate").send(newCandidate);
    expect(res.status).toBe(201);
    expect(res.body.skills).toBe("JavaScript, Networking");
    expect(res.body.previousRoles).toBe("Tutor");
    expect(res.body.availability).toBe(Availability.FULL_TIME);
    expect(res.body.academicCredentials).toBe("BSc IT");
  });

 
  

  // Test 2 - Gets all candidates "should return one if created"
  it("should return all candidates", async () => {
    const repo = AppDataSource.getRepository(Candidate);
    await repo.save(repo.create({
      candidateID: userID,
      user: { userID },
      previousRoles: "Lab Assistant",
    }));

    const res = await request(app).get("/api/candidate");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  // Test 3 - Gets the candidate by ID
  it("should return one candidate by candidateID", async () => {
    const repo = AppDataSource.getRepository(Candidate);
    await repo.save(repo.create({
      candidateID: userID,
      user: { userID },
      previousRoles: "Lab Assistant",
    }));

    const res = await request(app).get(`/api/candidate/${userID}`);
    expect(res.status).toBe(200);
    expect(res.body.previousRoles).toBe("Lab Assistant");
  });

  // Test 4 - Returns 404 if candidate not found
 it("should delete a candidate successfully", async () => {
  //  It creates a user
  const newUser = {
    email: "deleteuser@gmail.com",
    password: "Pass1234!",
    firstName: "Majid",
    lastName: "Nurahmed",
    role: "candidate"
  };

  const userRes = await request(app).post("/api/user").send(newUser);
  const userID = userRes.body.userID;

  // deletes the candidate
  const deleteRes = await request(app).delete(`/api/candidate/${userID}`);
  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body.message).toBe("Candidate deleted");

  // It Confirm deletion
  const fetchRes = await request(app).get(`/api/candidate/${userID}`);
  expect(fetchRes.status).toBe(404);
});


  // Test 5 - Successfully update candidate fields
  it("should update candidate fields", async () => {
    const repo = AppDataSource.getRepository(Candidate);
    await repo.save(repo.create({
      candidateID: userID,
      user: { userID },
      previousRoles: "Old Role",
    }));

    const res = await request(app).put(`/api/candidate/${userID}`).send({
      previousRoles: "Updated Role",
      skills: "Node.js, React"
    });

    expect(res.status).toBe(200);
    expect(res.body.previousRoles).toBe("Updated Role");
    expect(res.body.skills).toBe("Node.js, React");
  });
});
