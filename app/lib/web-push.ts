import fs from "node:fs";
import path from "node:path";
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

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BLy9-s3PpXKDQmQSGno9iZOiJ2FGWYNYiCIH0vYZK3y7pctD2jFlTFzlp2OHOlxpF5POeeZT85hECsbEgKX6zhA";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "JFs3kLdjnNUoWCvimpj_OICSYK-BXa6t29KAJAXMgNQ";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:concierge@safafragrance.com";

let vapidConfigured = false;
function ensureVapidConfig() {
  if (!vapidConfigured && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      vapidConfigured = true;
    } catch (err) {
      console.error("Failed to initialize VAPID details:", err);
    }
  }
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "data", "push-subscriptions.json");

function readSubscriptions(): PushSubscriptionRecord[] {
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

function writeSubscriptions(subs: PushSubscriptionRecord[]): void {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save push subscriptions:", err);
  }
}

export function saveSubscription(
  sub: PushSubscriptionRecord,
  userAgent?: string
): { success: boolean; total: number } {
  const current = readSubscriptions();
  const existingIndex = current.findIndex((item) => item.endpoint === sub.endpoint);

  const record: PushSubscriptionRecord = {
    ...sub,
    createdAt: new Date().toISOString(),
    userAgent: userAgent || "Unknown Device",
  };

  if (existingIndex >= 0) {
    current[existingIndex] = record;
  } else {
    current.push(record);
  }

  writeSubscriptions(current);
  return { success: true, total: current.length };
}

export function getAllSubscriptions(): PushSubscriptionRecord[] {
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
      const current = readSubscriptions().filter((s) => s.endpoint !== subscription.endpoint);
      writeSubscriptions(current);
    }
    console.error("Failed to send push notification to user:", err);
    return false;
  }
}

export async function broadcastNotification(
  payload: PushPayload
): Promise<{ sent: number; failed: number; total: number }> {
  ensureVapidConfig();

  const subscriptions = readSubscriptions();
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
    writeSubscriptions(cleaned);
  }

  return { sent, failed, total: subscriptions.length };
}
