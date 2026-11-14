import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { sendNotification, setVapidDetails } from "web-push";

export type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt?: string;
  userAgent?: string;
};

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
};

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:concierge@safafragrance.com";

let vapidConfigured = false;
function ensureVapidConfig() {
  if (vapidConfigured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error("Web push VAPID keys are not configured");
  }
  setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "data", "push-subscriptions.json");

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

async function ensureSubscriptionTable(): Promise<void> {
  await getSql()`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      "expirationTime" BIGINT,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "userAgent" TEXT
    )
  `;
}

async function readSubscriptions(): Promise<PushSubscriptionRecord[]> {
  try {
    await ensureSubscriptionTable();
    const rows = await getSql()`
      SELECT endpoint, "expirationTime", p256dh, auth, "createdAt", "userAgent"
      FROM push_subscriptions
    `;
    return rows.map((row) => ({
      endpoint: String(row.endpoint),
      expirationTime: row.expirationTime === null ? null : Number(row.expirationTime),
      keys: { p256dh: String(row.p256dh), auth: String(row.auth) },
      createdAt: row.createdAt ? new Date(String(row.createdAt)).toISOString() : undefined,
      userAgent: row.userAgent ? String(row.userAgent) : undefined,
    }));
  } catch (error) {
    console.error("Failed to read push subscriptions from database:", error);
    return readLocalSubscriptions();
  }
}

function readLocalSubscriptions(): PushSubscriptionRecord[] {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

async function writeSubscriptions(subs: PushSubscriptionRecord[]): Promise<void> {
  try {
    await ensureSubscriptionTable();
    const sql = getSql();
    await sql`DELETE FROM push_subscriptions`;
    for (const sub of subs) {
      await sql`
        INSERT INTO push_subscriptions (endpoint, "expirationTime", p256dh, auth, "createdAt", "userAgent")
        VALUES (
          ${sub.endpoint},
          ${sub.expirationTime ?? null},
          ${sub.keys.p256dh},
          ${sub.keys.auth},
          ${sub.createdAt ? new Date(sub.createdAt) : new Date()},
          ${sub.userAgent ?? null}
        )
        ON CONFLICT (endpoint) DO UPDATE SET
          "expirationTime" = EXCLUDED."expirationTime",
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          "createdAt" = EXCLUDED."createdAt",
          "userAgent" = EXCLUDED."userAgent"
      `;
    }
  } catch (err) {
    console.error("Failed to save push subscriptions:", err);
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
  }
}

export async function saveSubscription(
  sub: PushSubscriptionRecord,
  userAgent?: string
): Promise<{ success: boolean; total: number }> {
  const record: PushSubscriptionRecord = {
    ...sub,
    createdAt: new Date().toISOString(),
    userAgent: userAgent || "Unknown Device",
  };
  await writeSubscriptions([...(await readSubscriptions()).filter((item) => item.endpoint !== sub.endpoint), record]);
  return { success: true, total: (await readSubscriptions()).length };
}

export async function getAllSubscriptions(): Promise<PushSubscriptionRecord[]> {
  return readSubscriptions();
}

export async function sendNotificationToUser(
  subscription: PushSubscriptionRecord,
  payload: PushPayload
): Promise<boolean> {
  ensureVapidConfig();

  try {
    await sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired or uninstalled, remove it
      const current = (await readSubscriptions()).filter((s) => s.endpoint !== subscription.endpoint);
      await writeSubscriptions(current);
    }
    console.error("Failed to send push notification to user:", err);
    return false;
  }
}

export async function broadcastNotification(
  payload: PushPayload
): Promise<{ sent: number; failed: number; total: number }> {
  ensureVapidConfig();

  const subscriptions = await readSubscriptions();
  let sent = 0;
  let failed = 0;

  const validEndpoints: string[] = [];

  for (const sub of subscriptions) {
    try {
      await sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        JSON.stringify(payload)
      );
      sent++;
      validEndpoints.push(sub.endpoint);
    } catch (err: unknown) {
      failed++;
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode !== 410 && statusCode !== 404) {
        // Keep subscription if it wasn't explicitly expired
        validEndpoints.push(sub.endpoint);
      }
    }
  }

  if (validEndpoints.length !== subscriptions.length) {
    const cleaned = subscriptions.filter((s) => validEndpoints.includes(s.endpoint));
    await writeSubscriptions(cleaned);
  }

  return { sent, failed, total: subscriptions.length };
}
