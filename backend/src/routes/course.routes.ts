import { Router } from "express";
import { CourseController } from "../controller/CourseController";
import { validateDto } from "../middleware/validate";
import { CreateCourseDto } from "../dtos/create-course.dto";
import { UpdateCourseDto } from "../dtos/update-course.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new CourseController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:courseID", (req, res) => 
  controller.getOne(req, res)
);

router.get("/:courseID/lecturers", (req, res) => 
  controller.getLecturerCourses(req, res)
);

router.get("/:courseID/applied-candidates", (req, res) => 
  controller.getAppliedCourses(req, res)
);

router.post("/", validateDto(CreateCourseDto), (req, res) => 
  controller.create(req, res)
);

router.put("/:courseID", validateDto(UpdateCourseDto), (req, res) => 
  controller.update(req, res)
);

router.delete("/:courseID", (req, res) => 
  controller.delete(req, res)
);

export default router;
