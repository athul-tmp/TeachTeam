import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { AppDataSource } from "../../data-source";
import { Course } from "../../entity/Course";


// Reference: Based on Week 10 Lecture code

describe("Course Routes", () => {

  // It Clears all courses before each test to isolate results
  beforeEach(async () => {
    const repo = AppDataSource.getRepository(Course);
    await repo.clear();
  });

  // Test 1 - Creating a valid course should succeed
  it("should create a new course", async () => {
    const newCourse = {
      code: "COSC2758",
      name: "Full Stack Development",
      semester: "Semester 2"
    };

    const res = await request(app).post("/api/course").send(newCourse);

    expect(res.status).toBe(201); 
    expect(res.body.code).toBe("COSC2758"); 
  });

  // Test 2 - It Returns all existing courses
  it("should return all courses", async () => {
    const repo = AppDataSource.getRepository(Course);
    await repo.save(repo.create({
      code: "COSC2938",
      name: "Futher Web Programming",
      semester: "Semester 2"
    }));

    const res = await request(app).get("/api/course");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Only 1 course exists after beforeEach
    expect(res.body.length).toBe(1); 
  });

  //  Test 3 - Gets specific course by ID
  it("should return one course by ID", async () => {
    const repo = AppDataSource.getRepository(Course);
    const course = await repo.save(repo.create({
      code: "COSC2819",
      name: "Data Science",
      semester: "Semester 2"
    }));

    const res = await request(app).get(`/api/course/${course.courseID}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Data Science");
  });

  // Test 4 - Returns 404 for invalid course ID
  it("should return 404 if course not found", async () => {
    // Non-existent ID
    const res = await request(app).get("/api/course/99999"); 

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Course not found");
  });

  // Test 5 - It will Update an existing course
  it("should update an existing course", async () => {
    const repo = AppDataSource.getRepository(Course);
    const course = await repo.save(repo.create({
      code: "COSC3029",
      name: "Cyber Security",
      semester: "Semester 1"
    }));

    const res = await request(app)
      .put(`/api/course/${course.courseID}`)
      .send({
        code: "COSC2758",
        name: "Full Stack Developemt",
        semester: "Semester 1"
      });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("COSC2758");
    expect(res.body.name).toBe("Full Stack Developemt");
    expect(res.body.semester).toBe("Semester 1");
  });

  // Test 6 - It Deletes a course and ensure it's removed
  it("should delete a course", async () => {
    const repo = AppDataSource.getRepository(Course);
    const course = await repo.save(repo.create({
      code: "COSC2819",
      name: "Data Science",
      semester: "Semester 2"
    }));

    const res = await request(app).delete(`/api/course/${course.courseID}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Course deleted");

    // Checks if the course is truly gone
    const check = await request(app).get(`/api/course/${course.courseID}`);
    expect(check.status).toBe(404);
  });
});
