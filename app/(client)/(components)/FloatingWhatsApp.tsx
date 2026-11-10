'use client';

import { useState } from "react";
import { MessageSquare, X, Sparkles } from "lucide-react";

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Bubble */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-3xl p-5 border border-[#e5dbc7] shadow-2xl animate-in slide-in-from-bottom-2 duration-200 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#b39b66]">
                Safa Olfactory Concierge
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-neutral-900 font-sans tracking-wide">
              Seeking Personal Scent Guidance?
            </h4>
            <p className="text-xs text-neutral-600 font-normal leading-relaxed">
              Our master perfumer team is available on WhatsApp to guide your choice of notes, longevity, or custom decants.
            </p>
          </div>

          <a
            href="https://wa.me/923001234567?text=Hello%20Safa%20Fragrance,%20I%20would%20like%20guidance%20on%20choosing%20a%20signature%20scent."
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md border border-[#255840]"
          >
            <MessageSquare size={14} />
            <span>Start WhatsApp Chat</span>
          </a>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1b4431] hover:bg-[#0e281d] text-white shadow-xl border border-[#255840] transition-all hover:scale-105 active:scale-95"
        aria-label="Open Concierge Chat"
      >
        <span className="relative flex size-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d8c38c] opacity-75" />
          <span className="relative inline-flex rounded-full size-2.5 bg-[#d8c38c]" />
        </span>
        <MessageSquare size={16} className="text-[#d8c38c]" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Safa Concierge
        </span>
      </button>
    </div>
  );
}
