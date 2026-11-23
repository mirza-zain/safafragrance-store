"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Promo = {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  updatedAt: string;
};

export default function PromoPopup() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPromo() {
      try {
        const res = await fetch("/api/site-promo", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const nextPromo: Promo | null = data.promo ?? null;
        if (cancelled || !nextPromo) return;

        const dismissKey = `site-promo-dismissed:${nextPromo.updatedAt || nextPromo.imageUrl}`;
        const dismissed = window.localStorage.getItem(dismissKey);
        if (dismissed === "1") return;

        setPromo(nextPromo);
        // Small delay so it feels less abrupt on page load
        window.setTimeout(() => {
          if (!cancelled) setOpen(true);
        }, 1200);
      } catch {
        // ignore promo loading errors
      }
    }

    loadPromo();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    if (promo) {
      const dismissKey = `site-promo-dismissed:${promo.updatedAt || promo.imageUrl}`;
      window.localStorage.setItem(dismissKey, "1");
    }
    setOpen(false);
  }

  if (!open || !promo) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={promo.imageUrl}
      alt="Promotion"
      className="max-h-[80vh] w-auto max-w-[92vw] rounded-2xl object-contain shadow-2xl"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Promotion"
      onClick={dismiss}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close promotion"
          className="absolute -right-2 -top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-black/5 hover:bg-neutral-100 transition"
        >
          <X className="size-5" strokeWidth={2.5} />
        </button>

        {promo.linkUrl ? (
          <a
            href={promo.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>
  );
}
