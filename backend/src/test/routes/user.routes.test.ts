import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";

// Reference: Based on Week 10 Lecture Code

describe("User Routes", () => {
  beforeEach(async () => {
    //  It Clears the Candidate and User tables before each test to ensure isolation
    const candidateRepo = AppDataSource.getRepository("Candidate");
    await candidateRepo.delete({});

    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({});
  });

  // Test 1 - Successful user creation with all required fields
  it("should create a new user", async () => {
    const newUser = {
      email: "Majid@gmail.com",
      password: "Password123",
      firstName: "Majid",
      lastName: "Nurahmed",
      role: "candidate",
    };

    const res = await request(app).post("/api/user").send(newUser);
    expect(res.status).toBe(201);

    // Checks if response includes the correct user details
    expect(res.body.email).toBe("Majid@gmail.com");
    expect(res.body.firstName).toBe("Majid");
    expect(res.body.lastName).toBe("Nurahmed");
    expect(res.body.role).toBe("candidate");
  });

  // Test 2 validation - User creation fails when email is missing
  it("should return 400 if email is missing", async () => {
    const invalidUser = {
      password: "Password123",
      firstName: "Majid",
      lastName: "Nurahmed",
      role: "candidate",
    };

    const res = await request(app).post("/api/user").send(invalidUser);
    expect(res.status).toBe(400);
  });
  

  // Test 3 - Prevent duplicate email registration & enforces uniqueness on email
  it("should return 409 if user with same email exists", async () => {
    const user = {
      email: "duplicate@gmail.com",
      password: "Password123",
      firstName: "Majid",
      lastName: "Nurahmed",
      role: "candidate",
    };

  
    await request(app).post("/api/user").send(user);
   const res = await request(app).post("/api/user").send(user);
    expect(res.status).toBe(409);
  });


  // Test 4 - Checks that the GET route works and returns an array of users
  it("should return all users", async () => {
    const user = {
      email: "getall@gmail.com",
      password: "Password123",
      firstName: "Majid",
      lastName: "Nurahned",
      role: "candidate",
    };

    
    await request(app).post("/api/user").send(user);
     // Fetch all users
    const res = await request(app).get("/api/user");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].email).toBe("getall@gmail.com");
  });


  // Test 5 -  It should return 404 if the user has an invalid ID
  // The API correctly handles nonexistent IDs 
  it("should return 404 when user does not exist", async () => {
    const res = await request(app).get("/api/user/99999");

    expect(res.status).toBe(404);
  });

  // Test 6 - Get user by valid ID
  //Test checking to retrieve a user by ID after creation
  it("should return the correct user by ID", async () => {
    const user = {
      email: "Majid@gmail.com",
      password: "Password123",
      firstName: "Majid",
      lastName: "Nurahmed",
      role: "candidate",
    };

    const postRes = await request(app).post("/api/user").send(user);
    const userID = postRes.body.userID;
    const res = await request(app).get(`/api/user/${userID}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("Majid@gmail.com");
    expect(res.body.userID).toBe(userID);
  });
});
