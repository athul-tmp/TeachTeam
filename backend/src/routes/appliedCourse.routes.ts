import { Router } from "express";
import { AppliedCourseController } from "../controller/AppliedCourseController";
import { validateDto } from "../middleware/validate";
import { CreateAppliedCourseDto } from "../dtos/create-appliedCourse.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new AppliedCourseController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:candidateID/:courseID/:role", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateAppliedCourseDto), (req, res) => 
  controller.create(req, res)
);

router.delete("/:candidateID/:courseID/:role", (req, res) => 
  controller.delete(req, res)
);

export default router;
