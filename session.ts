import jwt from "jsonwebtoken";

import { User } from "@/app/api/users/users.validation";

type SessionData = {
  user: { id: number };
  expires: string;
};

const secret = process.env.AUTH_SECRET;

export async function signToken(payload: SessionData) {
  return jwt.sign(payload, secret!, {
    expiresIn: "8h",
    algorithm: "HS256",
    issuer: "nextjs_fullstack",
  });
}

export async function verifyToken(input: string) {
  try {
    return jwt.verify(input, secret!, {
      algorithms: ["HS256"],
      issuer: "nextjs_fullstack",
    });
  } catch (err) {
    return null;
  }
}

export type TokenPayload = Awaited<ReturnType<typeof verifyToken>>;

export async function setSession(user: Partial<User>) {
  const eight_hour_time_in_seconds = 8 * 60 * 60;
  const expiresIn = new Date(Date.now() + eight_hour_time_in_seconds * 1000);

  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresIn.toISOString(),
  };
  const encryptedSession = await signToken(session);
  return {
    acessToken: encryptedSession,
    expiresIn: eight_hour_time_in_seconds,
  };
}
