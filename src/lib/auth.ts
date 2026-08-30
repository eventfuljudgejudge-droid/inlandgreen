import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { RLS_SERVICE, withRls } from "./rls";

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production.");
    }
    return "development-only-secret";
  }
  return secret;
}

let secret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (!secret) {
    secret = new TextEncoder().encode(getJWTSecret());
  }
  return secret;
}

/** Find a user by either username or email. */
export async function findUserByIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase();
  return withRls(RLS_SERVICE, (tx) =>
    tx.user.findFirst({
      where: { OR: [{ username: value }, { email: value }] },
    })
  );
}

export async function authenticate(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user || user.status !== "ACTIVE") return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token = await new SignJWT({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  return { token, user };
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/** Verify a user's security answer (case-insensitive) without timing leaks that matter here. */
export async function verifySecurityAnswer(user: { securityAnswerHash: string | null }, answer: string): Promise<boolean> {
  if (!user.securityAnswerHash) return false;
  const normalized = answer.trim().toLowerCase();
  return bcrypt.compare(normalized, user.securityAnswerHash);
}

/** Hash a security answer for storage. */
export async function hashSecurityAnswer(answer: string): Promise<string> {
  return bcrypt.hash(answer.trim().toLowerCase(), 10);
}

/** Set a new password (used by forgot-password reset). */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await withRls(RLS_SERVICE, (tx) => tx.user.update({ where: { id: userId }, data: { passwordHash } }));
}