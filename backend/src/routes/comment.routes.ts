import { Router } from "express";
import { CommentController } from "../controller/CommentController";
import { validateDto } from "../middleware/validate";
import { CreateCommentDto } from "../dtos/create-comment.dto";
import { UpdateCommentDto } from "../dtos/update-comment.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new CommentController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:commentID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateCommentDto), (req, res) => 
  controller.create(req, res)
);

router.put("/:commentID", validateDto(UpdateCommentDto), (req, res) => 
  controller.update(req, res)
);

router.delete("/:commentID", (req, res) => 
  controller.delete(req, res)
);

router.get("/candidate/:candidateID", (req, res) => 
  controller.getCommentsForCandidate(req, res)
);

router.get("/lecturer/:lecturerID", (req, res) => 
  controller.getCommentsForLecturer(req, res)
);

export default router;
