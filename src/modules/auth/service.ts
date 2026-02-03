import { verifyPassword } from "../../helpers/password";
import { signToken } from "../../helpers/jwt";
import { findUserByIdentifier } from "./db";

export const loginService = async (identifier: string, password: string) => {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    return null;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return null;
  }

  const token = signToken({ sub: user.id, role: user.role, identifier });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    }
  };
};
