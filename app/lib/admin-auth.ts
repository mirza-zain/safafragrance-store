import crypto from "node:crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "safa-fragrance-secure-admin-secret-2026-key";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@safafragrance.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "safa2026!";
export const COOKIE_NAME = "safa_admin_token";

export function signAdminToken(email: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!token || !token.includes(".")) return false;
  try {
    const [encodedPayload, receivedHmac] = token.split(".");
    const payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const [email, expiresAtStr] = payload.split(":");

    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false;

    const expectedHmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
      return false;
    }

    return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  } catch {
    return false;
  }
}
