import type { Request, Response, NextFunction } from "express";
import { loginService } from "./service";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, email, username, phone, password } = req.body as {
      identifier?: string;
      email?: string;
      username?: string;
      phone?: string;
      password?: string;
    };

    const loginIdentifier = identifier || email || username || phone;

    if (!loginIdentifier || !password) {
      res.status(400).json({ error: "identifier and password are required" });
      return;
    }

    const result = await loginService(loginIdentifier, password);

    if (!result) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};
