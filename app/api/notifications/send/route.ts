import { NextResponse } from "next/server";
import { broadcastNotification, getAllSubscriptions, PushPayload } from "@/app/lib/web-push";
import { isAdminRequest } from "@/app/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    const payload: PushPayload = {
      title: body.title || "Safa Fragrance Haute Parfumerie",
      body: body.body || "A new limited edition private reserve has been uncorked.",
      icon: body.icon || "/logo.png",
      badge: body.badge || "/images/favicon/favicon-96x96.png",
      image: body.image,
      url: body.url || "/",
      tag: body.tag || "safa-announcement",
    };

    const subscribers = await getAllSubscriptions();

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No active push notification subscribers found.",
        sent: 0,
        failed: 0,
        total: 0,
      });
    }

    const result = await broadcastNotification(payload);

    return NextResponse.json({
      success: true,
      message: `Dispatched push notification to ${result.sent} recipient(s).`,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Push notification broadcast error:", err);
    return NextResponse.json(
      { error: "Failed to broadcast push notification", details: err.message },
      { status: 500 }
    );
  }
}
