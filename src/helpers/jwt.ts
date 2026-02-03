import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR";
  identifier: string;
};

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
