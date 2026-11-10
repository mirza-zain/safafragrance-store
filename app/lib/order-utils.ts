export type SalesChannel = "instagram" | "reference" | "whatsapp" | "direct" | "website";

export function getOrderChannel(order: {
  paymentMethod?: string | null;
  discountCode?: string | null;
  trackingId?: string | null;
}): SalesChannel {
  const pm = (order.paymentMethod || "").toLowerCase();
  const dc = (order.discountCode || "").toLowerCase();
  const trk = (order.trackingId || "").toLowerCase();

  if (pm.includes("instagram") || dc.includes("instagram") || dc.includes("insta") || trk.startsWith("ig-")) {
    return "instagram";
  }
  if (pm.includes("reference") || dc.includes("reference") || dc.includes("ref") || trk.startsWith("ref-")) {
    return "reference";
  }
  if (pm.includes("whatsapp") || dc.includes("whatsapp") || trk.startsWith("wa-")) {
    return "whatsapp";
  }
  if (pm.includes("direct") || pm.includes("walk-in") || dc.includes("direct") || trk.startsWith("dir-")) {
    return "direct";
  }
  return "website";
}

export function getChannelMeta(channel: SalesChannel) {
  switch (channel) {
    case "instagram":
      return {
        label: "Instagram",
        bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
        pill: "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white",
        iconEmoji: "📸",
      };
    case "reference":
      return {
        label: "Reference",
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        pill: "bg-indigo-600 text-white",
        iconEmoji: "🤝",
      };
    case "whatsapp":
      return {
        label: "WhatsApp",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pill: "bg-emerald-600 text-white",
        iconEmoji: "💬",
      };
    case "direct":
      return {
        label: "In-Person",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        pill: "bg-amber-600 text-white",
        iconEmoji: "🏬",
      };
    case "website":
    default:
      return {
        label: "Online Store",
        bg: "bg-neutral-100 text-neutral-700 border-neutral-200",
        pill: "bg-neutral-900 text-white",
        iconEmoji: "🌐",
      };
  }
}

export function formatRs(amount: number | string): string {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString()}`;
}

export function toMonthKey(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey || !monthKey.includes("-")) return monthKey;
  const [yearStr, monthStr] = monthKey.split("-");
  const d = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
