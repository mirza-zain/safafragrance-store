import { NextResponse } from "next/server";
import { getAllSubscriptions, saveSubscription } from "@/app/lib/web-push";
import { isAdminRequest } from "@/app/lib/admin-auth";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const endpoint = new URL(request.url).searchParams.get("endpoint");

  const total = (await getAllSubscriptions()).length;
  const subscriptions = endpoint ? await getAllSubscriptions() : [];

  return NextResponse.json({
    publicKey,
    configured: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY),
    subscribed: Boolean(endpoint && subscriptions.some((subscription) => subscription.endpoint === endpoint)),
    totalSubscribers: total,
    status: publicKey && process.env.VAPID_PRIVATE_KEY ? "active" : "unconfigured",
  });
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || undefined;

    if (!body || !body.endpoint || !body.keys || !body.keys.p256dh || !body.keys.auth) {
      return NextResponse.json(
        { error: "Invalid push subscription object. Required: endpoint, keys.p256dh, keys.auth" },
        { status: 400 }
      );
    }

    const result = await saveSubscription(body, userAgent);

    return NextResponse.json({
      success: true,
      message: "Push notification subscription registered successfully.",
      totalSubscribers: result.total,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Subscription registration error:", err);
    return NextResponse.json(
      { error: "Failed to save push subscription", details: err.message },
      { status: 500 }
    );
  }
}
