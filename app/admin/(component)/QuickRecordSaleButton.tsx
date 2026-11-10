'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ManualSaleModal from "./ManualSaleModal";

export default function QuickRecordSaleButton({ 
  className = "inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-[0.98]" 
}: { 
  className?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Plus className="size-4" />
        <span>Record Sale (Insta / Ref)</span>
      </button>

      <ManualSaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
