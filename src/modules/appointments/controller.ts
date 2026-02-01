import type { Request, Response, NextFunction } from "express";
import { createAppointmentService, listAppointmentsService } from "./service";

export const listAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await listAppointmentsService(req.user!);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const createAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, startsAt, endsAt, status, doctorId } = req.body as {
      title?: string;
      startsAt?: string;
      endsAt?: string;
      status?: string;
      doctorId?: string;
    };

    if (!title || !startsAt || !endsAt) {
      res.status(400).json({ error: "title, startsAt, endsAt are required" });
      return;
    }

    const appointment = await createAppointmentService({ title, startsAt, endsAt, status, doctorId });

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
