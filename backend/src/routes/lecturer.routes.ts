import { Router } from "express";
import { LecturerController } from "../controller/LecturerController";
import { validateDto } from "../middleware/validate";
import { CreateLecturerDto } from "../dtos/create-lecturer.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new LecturerController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:lecturerID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateLecturerDto), (req, res) => 
  controller.create(req, res)
);

router.delete("/:lecturerID", (req, res) => 
  controller.delete(req, res)
);

router.get("/:lecturerID/courses", (req, res) => 
  controller.getCourses(req, res)
);

router.get("/:lecturerID/selected-candidates", (req, res) => 
  controller.getSelectedCandidates(req, res)
);

router.get("/:lecturerID/comments", (req, res) => 
  controller.getComments(req, res)
);

router.get("/:lecturerID/applicants/filter", (req, res) =>
  controller.getFilteredApplicants(req, res)
);

export default router;
