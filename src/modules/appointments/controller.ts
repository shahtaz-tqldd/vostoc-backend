import type { Request, Response, NextFunction } from "express";
import {
  createAppointmentService,
  getPatientByContactNumberService,
  listAppointmentsService
} from "./service";

export const listAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
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

    const appointments = await listAppointmentsService({
      user: req.user!,
      page: page,
      pageSize: pageSize,
      search: search
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const createAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientNotes,
      department,
      doctorId,
      appointmentDate,
      appointmentTime
    } = req.body as {
      patientName?: string;
      patientPhone?: string;
      patientAge?: number;
      patientGender?: string;
      patientNotes?: string;
      department?: string;
      doctorId?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    };

    const departmentId = department;

    if (
      !patientName ||
      !patientPhone ||
      patientAge === undefined ||
      !patientGender ||
      !departmentId ||
      !doctorId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      res.status(400).json({
        error:
          "patientName, patientPhone, patientAge, patientGender, department, doctorId, appointmentDate, appointmentTime are required"
      });
      return;
    }

    if (!Number.isInteger(patientAge) || patientAge <= 0) {
      res.status(400).json({ error: "patientAge must be a positive integer" });
      return;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(appointmentDate) || Number.isNaN(new Date(`${appointmentDate}T00:00:00.000Z`).getTime())) {
      res.status(400).json({ error: "appointmentDate must be in YYYY-MM-DD format" });
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(appointmentTime)) {
      res.status(400).json({ error: "appointmentTime must be in HH:mm format" });
      return;
    }

    const appointment = await createAppointmentService({
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      patientNotes,
      departmentId,
      doctorId,
      appointmentDate,
      appointmentTime
    });

    const io = req.app.get("io");
    if (io) {
      io.to("appointments").emit("appointments:created", appointment);
      io.to("dashboard").emit("dashboard:updated", { type: "appointments", appointment });
    }

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

export const getPatientByContactNumberController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactNumber } = req.query as { contactNumber?: string };

    if (!contactNumber) {
      res.status(400).json({ error: "contactNumber is required" });
      return;
    }

    const patient = await getPatientByContactNumberService(contactNumber);
    res.json(
      patient || {
        patientName: null,
        patientAge: null,
        patientGender: null,
        department: null,
        departmentId: null,
        doctorId: null
      }
    );
  } catch (err) {
    next(err);
  }
};
