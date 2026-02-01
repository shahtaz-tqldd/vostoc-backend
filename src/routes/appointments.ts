import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { startsAt: "asc" }
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, startsAt, endsAt, status } = req.body as {
      title?: string;
      startsAt?: string;
      endsAt?: string;
      status?: string;
    };

    if (!title || !startsAt || !endsAt) {
      res.status(400).json({ error: "title, startsAt, endsAt are required" });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: status || "scheduled"
      }
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
});

export default router;
