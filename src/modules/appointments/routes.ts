import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  createAppointmentController,
  getNextPatientQueueController,
  getTodayAppointmentStatsController,
  getPatientByContactNumberController,
  listAppointmentsController
} from "./controller";

const router = Router();

router.get("/stats/today", requireAuth, requireRole("ADMIN", "RECEPTIONIST", "DOCTOR"), getTodayAppointmentStatsController);
router.get("/queue/next", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), getNextPatientQueueController);
router.get("/", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), listAppointmentsController);
router.get("/patients", requireAuth, getPatientByContactNumberController);
router.post("/", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), createAppointmentController);

export default router;
