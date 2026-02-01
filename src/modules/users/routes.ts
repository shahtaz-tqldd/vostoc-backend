import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { createUserController, listUsersController, meController } from "./controller";

const router = Router();

router.get("/me", requireAuth, meController);
router.post("/", requireAuth, requireRole("ADMIN"), createUserController);
router.get("/", requireAuth, requireRole("ADMIN"), listUsersController);

export default router;
