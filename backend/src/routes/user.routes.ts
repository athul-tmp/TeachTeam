import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validateDto } from "../middleware/validate";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

// Reference: Based on Week 9 Lecture code

const router = Router();
const controller = new UserController();

router.get("/", (req, res) => 
  controller.getAll(req, res)
);

router.get("/:userID", (req, res) => 
  controller.getOne(req, res)
);

router.post("/", validateDto(CreateUserDto), (req, res) => 
  controller.create(req, res)
);

router.put("/:userID", validateDto(UpdateUserDto), (req, res) => 
  controller.update(req, res)
);

router.delete("/:userID", (req, res) => 
  controller.delete(req, res)
);

router.post("/login", (req, res) => 
  controller.login(req, res)
);

export default router;
