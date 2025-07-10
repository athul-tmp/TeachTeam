import { Router } from "express";
import { SelectedCandidateController } from "../controller/SelectedCandidateController";
import { validateDto } from "../middleware/validate";
import { CreateSelectedCandidateDto } from "../dtos/create-selectedCandidate.dto";
import { UpdateSelectedCandidateDto } from "../dtos/update-selectedCandidate.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new SelectedCandidateController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:lecturerID/:candidateID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateSelectedCandidateDto), (req, res) => 
  controller.create(req, res)
);

router.put("/:lecturerID/:candidateID", validateDto(UpdateSelectedCandidateDto), (req, res) => 
  controller.update(req, res)
);

router.delete("/:lecturerID/:candidateID", (req, res) => 
  controller.delete(req, res)
);

router.get("/candidate-selection-counts", (req, res) => 
  controller.getCandidateSelectionCounts(req, res)
);

export default router;
