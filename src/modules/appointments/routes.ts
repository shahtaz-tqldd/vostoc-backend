import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { createAppointmentController, listAppointmentsController } from "./controller";

const router = Router();

router.get("/", requireAuth, listAppointmentsController);
router.post("/", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), createAppointmentController);

export default router;
