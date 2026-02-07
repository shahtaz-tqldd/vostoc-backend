import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { uploadSingleImage } from "../../middlewares/upload";
import { createReceptionistController, listReceptionistsController } from "./controller";

const router = Router();

router.get("/", requireAuth, listReceptionistsController);
router.post("/create", requireAuth, requireRole("ADMIN"), uploadSingleImage, createReceptionistController);

export default router;
