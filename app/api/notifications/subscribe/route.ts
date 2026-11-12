import { NextResponse } from "next/server";
import { getAllSubscriptions, saveSubscription } from "@/app/lib/web-push";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  const total = getAllSubscriptions().length;

  return NextResponse.json({
    publicKey,
    totalSubscribers: total,
    status: "active",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || undefined;

    if (!body || !body.endpoint || !body.keys || !body.keys.p256dh || !body.keys.auth) {
      return NextResponse.json(
        { error: "Invalid push subscription object. Required: endpoint, keys.p256dh, keys.auth" },
        { status: 400 }
      );
    }

    const result = saveSubscription(body, userAgent);

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
