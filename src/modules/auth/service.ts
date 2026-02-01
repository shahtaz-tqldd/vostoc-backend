import { verifyPassword } from "../../helpers/password";
import { signToken } from "../../helpers/jwt";
import { findUserByEmail } from "./db";

export const loginService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return null;
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  };
};
