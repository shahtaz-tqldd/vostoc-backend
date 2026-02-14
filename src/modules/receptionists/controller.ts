import type { NextFunction, Request, Response } from "express";
import { createReceptionistService, listReceptionistsService } from "./service";

export const createReceptionistController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      department_ids: departmentIds,
      contact_number: contactNumber,
      shift,
      description,
      username,
      password
    } = req.body as {
      name?: string;
      department_ids?: string[];
      contact_number?: string;
      shift?: string;
      description?: string;
      username?: string;
      password?: string;
    };

    const normalizedDepartmentIds =
      Array.isArray(departmentIds) ? departmentIds.map((id) => id?.trim()).filter(Boolean) : [];

    if (!name || normalizedDepartmentIds.length === 0 || !contactNumber || !shift || !username || !password) {
      res.status(400).json({
        error: "name, department_ids, contact_number, shift, username, and password are required"
      });
      return;
    }

    const receptionist = await createReceptionistService({
      name: name.trim(),
      departmentIds: normalizedDepartmentIds,
      contactNumber: contactNumber.trim(),
      shift: shift.trim(),
      description: description?.trim() || undefined,
      image: req.file || undefined,
      username: username.trim(),
      password: password.trim()
    });

    res.status(201).json(receptionist);
  } catch (err) {
    if (err instanceof Error && (err.message.includes("not found") || err.message.includes("Invalid"))) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

export const listReceptionistsController = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await listReceptionistsService({ page, pageSize, search });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
