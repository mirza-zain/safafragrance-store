import crypto from "node:crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
export const COOKIE_NAME = "safa_admin_token";

export function signAdminToken(email: string): string {
  if (!ADMIN_SECRET) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!ADMIN_SECRET || !token || !token.includes(".")) return false;
  try {
    const [encodedPayload, receivedHmac] = token.split(".");
    const payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const [email, expiresAtStr] = payload.split(":");

    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false;

    const expectedHmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
    if (
      receivedHmac.length !== expectedHmac.length ||
      !crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))
    ) {
      return false;
    }

    return Boolean(email);
  } catch {
    return false;
  }
}

export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!token) return false;

  try {
    return verifyAdminToken(decodeURIComponent(token));
  } catch {
    return false;
  }
}
