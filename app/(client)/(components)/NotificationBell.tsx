'use client';

import { useState, useEffect } from "react";
import { Bell, BellRing, Check, Send, X, Sparkles } from "lucide-react";
import {
  subscribeUserToPush,
  getNotificationPermissionStatus,
  registerPushServiceWorker,
} from "@/app/lib/push-client";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    registerPushServiceWorker();
    getNotificationPermissionStatus().then((perm) => {
      setPermission(perm);
    });
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setStatusMessage(null);
    const result = await subscribeUserToPush();
    setLoading(false);

    if (result.success) {
      setPermission("granted");
      setStatusMessage("Notifications enabled! You can now receive order & drop alerts.");
    } else {
      setStatusMessage(result.message);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Safa Fragrance • Haute Parfumerie",
          body: "Your notification key is verified! Order and dispatch alerts are live.",
          url: "/",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Test push notification dispatched! Check your desktop/mobile alerts.");
      } else {
        setStatusMessage(data.message || "Failed to trigger test notification.");
      }
    } catch {
      setStatusMessage("Failed to reach notification server.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notification Preferences"
        className="relative p-2.5 rounded-full hover:bg-[#eee6d7] text-neutral-800 transition flex items-center justify-center group"
      >
        {permission === "granted" ? (
          <BellRing size={20} className="text-[#1b4431] transition-transform group-hover:scale-105" />
        ) : (
          <Bell size={20} className="group-hover:text-[#1b4431] transition-transform group-hover:scale-105" />
        )}
        {permission === "default" && (
          <span className="absolute top-1.5 right-1.5 size-2 bg-[#b39b66] rounded-full animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-5 shadow-2xl border border-[#e7decb] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-[#eee6d7]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-[#1b4431]/10 text-[#1b4431]">
                <Sparkles size={14} className="text-[#b39b66]" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-sans">
                  Safa Concierge Alerts
                </h4>
                <p className="text-[10px] text-neutral-500">Web Push Notifications</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="py-4 space-y-3">
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Receive immediate push notifications when your fragrance parcel is dispatched, plus private reserve releases.
            </p>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#e7decb] text-[11px] text-[#1b4431] font-medium animate-in fade-in">
                {statusMessage}
              </div>
            )}

            {permission !== "granted" ? (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Enabling...</span>
                ) : (
                  <>
                    <Bell size={14} />
                    <span>Enable Web Notifications</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <Check size={14} />
                  <span>Notifications are Active</span>
                </div>

                <button
                  onClick={handleTestNotification}
                  disabled={testing}
                  className="w-full py-2.5 rounded-xl border border-[#1b4431] text-[#1b4431] hover:bg-[#1b4431] hover:text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={13} />
                  <span>{testing ? "Sending..." : "Send Test Notification"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#eee6d7] text-[10px] text-neutral-400 flex items-center justify-between">
            <span>VAPID Cryptographic Auth</span>
            <span>No spam guaranteed</span>
          </div>
        </div>
      )}
    </div>
  );
}
