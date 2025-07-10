import { Router } from "express";
import { LecturerCourseController } from "../controller/LecturerCourseController";
import { validateDto } from "../middleware/validate";
import { CreateLecturerCourseDto } from "../dtos/create-lecturerCourse.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new LecturerCourseController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:lecturerID/:courseID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateLecturerCourseDto), (req, res) => 
  controller.create(req, res)
);

router.delete("/:lecturerID/:courseID", (req, res) => 
  controller.delete(req, res)
);

export default router;
