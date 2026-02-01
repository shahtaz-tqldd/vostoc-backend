import type { Request, Response, NextFunction } from "express";
import { createUserService, getMeService, listUsersService } from "./service";

export const meController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getMeService(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password, role } = req.body as {
      email?: string;
      name?: string;
      password?: string;
      role?: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
    };

    if (!email || !name || !password || !role) {
      res.status(400).json({ error: "email, name, password, role are required" });
      return;
    }

    const user = await createUserService({ email, name, password, role });

    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
};

export const listUsersController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsersService();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
