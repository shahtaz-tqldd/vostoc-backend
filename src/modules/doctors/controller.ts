import type { NextFunction, Request, Response } from "express";
import { createDoctorService, listDoctorsService } from "./service";

export const createDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      department_id: departmentId,
      specialty,
      contact_number: contactNumber,
      description,
      schedules,
      username,
      password
    } = req.body as {
      name?: string;
      department_id?: string;
      specialty?: string;
      contact_number?: string;
      description?: string;
      schedules?: Array<Record<string, { start_time?: string; end_time?: string }[]>> | string;
      username?: string;
      password?: string;
    };

    if (!name || !departmentId || !specialty || !contactNumber) {
      res.status(400).json({
        error: "name, department_id, specialty, and contact_number are required"
      });
      return;
    }

    if ((username && !password) || (!username && password)) {
      res.status(400).json({ error: "username and password must be provided together" });
      return;
    }

    let normalizedSchedules: Array<Record<string, { start_time?: string; end_time?: string }[]>> | undefined;
    if (typeof schedules === "string") {
      try {
        normalizedSchedules = JSON.parse(schedules) as Array<
          Record<string, { start_time?: string; end_time?: string }[]>
        >;
      } catch {
        res.status(400).json({ error: "schedules must be valid JSON" });
        return;
      }
    } else {
      normalizedSchedules = schedules;
    }

    const doctor = await createDoctorService({
      name,
      departmentId,
      specialty,
      contactNumber,
      description,
      schedules: normalizedSchedules,
      image: req.file || undefined,
      username,
      password
    });

    res.status(201).json(doctor);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("not found") || err.message.includes("Invalid"))) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const listDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));

    let search: string | undefined;
    const rawFilters = req.query.filters;

    if (typeof rawFilters === "string" && rawFilters.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawFilters) as { search?: string };
        search = parsed.search?.trim() || undefined;
      } catch {
        res.status(400).json({ error: "filters must be valid JSON" });
        return;
      }
    }

    if (!search && typeof req.query.search === "string") {
      search = req.query.search.trim() || undefined;
    }

    const result = await listDoctorsService({ user: req.user!, page, pageSize, search });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
