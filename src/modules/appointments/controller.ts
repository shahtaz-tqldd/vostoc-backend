import type { Request, Response, NextFunction } from "express";
import {
  createAppointmentService,
  getNextPatientQueueService,
  getTodayAppointmentStatsService,
  getPatientByContactNumberService,
  listAppointmentsService
} from "./service";

export const listAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    let search: string | undefined;
    let startDate: string | undefined;
    let endDate: string | undefined;
    let departmentId: string | undefined;
    let doctorId: string | undefined;
    const rawFilters = req.query.filters;

    if (typeof rawFilters === "string" && rawFilters.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawFilters) as {
          search?: string;
          startDate?: string;
          endDate?: string;
          department_id?: string;
          doctor_id?: string;
          departmentId?: string;
          doctorId?: string;
        };
        search = parsed.search?.trim() || undefined;
        startDate = parsed.startDate?.trim() || undefined;
        endDate = parsed.endDate?.trim() || undefined;
        departmentId = parsed.department_id?.trim() || parsed.departmentId?.trim() || undefined;
        doctorId = parsed.doctor_id?.trim() || parsed.doctorId?.trim() || undefined;
      } catch {
        res.status(400).json({ error: "filters must be valid JSON" });
        return;
      }
    }

    if (!search && typeof req.query.search === "string") {
      search = req.query.search.trim() || undefined;
    }
    if (!startDate && typeof req.query.startDate === "string") {
      startDate = req.query.startDate.trim() || undefined;
    }
    if (!endDate && typeof req.query.endDate === "string") {
      endDate = req.query.endDate.trim() || undefined;
    }
    if (!departmentId && typeof req.query.department_id === "string") {
      departmentId = req.query.department_id.trim() || undefined;
    }
    if (!departmentId && typeof req.query.departmentId === "string") {
      departmentId = req.query.departmentId.trim() || undefined;
    }
    if (!doctorId && typeof req.query.doctor_id === "string") {
      doctorId = req.query.doctor_id.trim() || undefined;
    }
    if (!doctorId && typeof req.query.doctorId === "string") {
      doctorId = req.query.doctorId.trim() || undefined;
    }

    if (
      (startDate && (!datePattern.test(startDate) || Number.isNaN(new Date(`${startDate}T00:00:00.000Z`).getTime()))) ||
      (endDate && (!datePattern.test(endDate) || Number.isNaN(new Date(`${endDate}T00:00:00.000Z`).getTime())))
    ) {
      res.status(400).json({ error: "startDate and endDate must be in YYYY-MM-DD format" });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      res.status(400).json({ error: "startDate cannot be after endDate" });
      return;
    }

    const appointments = await listAppointmentsService({
      user: req.user!,
      page: page,
      pageSize: pageSize,
      search: search,
      startDate,
      endDate,
      departmentId,
      doctorId
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

export const getTodayAppointmentStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getTodayAppointmentStatsService(req.user!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getNextPatientQueueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queue = await getNextPatientQueueService(req.user!);
    res.json(queue);
  } catch (err) {
    next(err);
  }
};
