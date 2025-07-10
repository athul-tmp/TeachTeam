import { Router } from "express";
import { CandidateController } from "../controller/CandidateController";
import { validateDto } from "../middleware/validate";
import { CreateCandidateDto } from "../dtos/create-candidate.dto";
import { UpdateCandidateDto } from "../dtos/update-candidate.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new CandidateController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:candidateID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateCandidateDto), (req, res) => 
  controller.create(req, res)
);

router.put("/:candidateID", validateDto(UpdateCandidateDto), (req, res) => 
  controller.update(req, res)
);

router.delete("/:candidateID", (req, res) => 
  controller.delete(req, res)
);

router.get("/:candidateID/applied-courses", (req, res) => 
  controller.getAppliedCourses(req, res)
);

router.get("/:candidateID/selected-by-lecturers", (req, res) => 
  controller.getSelectedByLecturers(req, res)
);

router.get("/:candidateID/comments", (req, res) => 
  controller.getComments(req, res)
);

export default router;
