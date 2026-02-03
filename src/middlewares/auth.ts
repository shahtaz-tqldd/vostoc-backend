import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../helpers/jwt";

export type AuthUser = {
  id: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
  identifier: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing Bearer token" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, identifier: payload.identifier };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (...roles: AuthUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
};
