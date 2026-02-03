import type { Request, Response, NextFunction } from "express";
import { createUserService, getMeService, listUsersService } from "./service";

export const meController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getMeService(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, phone, name, password, role } = req.body as {
      username?: string;
      email?: string;
      phone?: string;
      name?: string;
      password?: string;
      role?: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
    };

    if (!username || !name || !password || !role) {
      res.status(400).json({ error: "username, name, password, role are required" });
      return;
    }

    const user = await createUserService({ username, email, phone, name, password, role });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    });
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
