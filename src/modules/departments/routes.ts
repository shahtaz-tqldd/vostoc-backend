import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  createDepartmentController,
  createSpecialtyController,
  listDepartmentsController,
  listSpecialtiesController,
  deleteDepartmentController
} from "./controller";

const router = Router();

router.get("/", requireAuth, listDepartmentsController);
router.post("/", requireAuth, requireRole("ADMIN"), createDepartmentController);
router.delete("/:departmentId", requireAuth, requireRole("ADMIN"), deleteDepartmentController);

router.get("/:departmentId/specialties", requireAuth, listSpecialtiesController);
router.post("/:departmentId/specialties", requireAuth, requireRole("ADMIN"), createSpecialtyController);

export default router;
