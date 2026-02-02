import type { NextFunction, Request, Response } from "express";
import {
  createDepartmentService,
  createSpecialtyService,
  deleteDepartmentService,
  listDepartmentsService,
  listSpecialtiesService
} from "./service";

export const listDepartmentsController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await listDepartmentsService();
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

export const createDepartmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, specialties } = req.body as { name?: string; specialties?: string[] };
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const department = await createDepartmentService({ name, specialties });
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

export const deleteDepartmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.params as { departmentId?: string };
    if (!departmentId) {
      res.status(400).json({ error: "departmentId is required" });
      return;
    }

    const department = await deleteDepartmentService({ departmentId });
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

export const listSpecialtiesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.params;
    const specialties = await listSpecialtiesService(departmentId);
    res.json(specialties);
  } catch (err) {
    next(err);
  }
};

export const createSpecialtyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.params;
    const { name } = req.body as { name?: string };

    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const specialty = await createSpecialtyService({ name, departmentId });
    res.status(201).json(specialty);
  } catch (err) {
    next(err);
  }
};
