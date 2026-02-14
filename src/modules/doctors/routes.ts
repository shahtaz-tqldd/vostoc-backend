import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { uploadSingleImage } from "../../middlewares/upload";
import { createDoctorController, listDoctorsController } from "./controller";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), listDoctorsController);
router.post("/create", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), uploadSingleImage, createDoctorController);

export default router;
