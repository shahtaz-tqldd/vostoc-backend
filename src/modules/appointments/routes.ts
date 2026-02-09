import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  createAppointmentController,
  getPatientByContactNumberController,
  listAppointmentsController
} from "./controller";

const router = Router();

router.get("/", requireAuth, listAppointmentsController);
router.get("/patients", requireAuth, getPatientByContactNumberController);
router.post("/", requireAuth, requireRole("ADMIN", "RECEPTIONIST"), createAppointmentController);

export default router;
