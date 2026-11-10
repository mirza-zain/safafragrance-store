'use client';

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

type Props = {
  orderId: number;
  totalAmount: number;
  paymentMethod?: string;
  initialPaymentStatus?: string;
  paymentReceipt?: string | null;
};

const paymentStatusLabels: Record<string, { label: string; class: string }> = {
  pending_verification: {
    label: "Verification Pending",
    class: "bg-amber-100 text-amber-900 border-amber-300"
  },
  paid: {
    label: "Verified & Paid",
    class: "bg-emerald-100 text-emerald-900 border-emerald-300"
  },
  rejected: {
    label: "Payment Declined",
    class: "bg-rose-100 text-rose-900 border-rose-300"
  },
  pending: {
    label: "Pending Payment",
    class: "bg-neutral-100 text-neutral-800 border-neutral-300"
  }
};

export default function PaymentVerificationCard({
  orderId,
  totalAmount,
  paymentMethod = "cod",
  initialPaymentStatus = "pending",
  paymentReceipt,
}: Props) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isBankTransfer = paymentMethod === "bank_transfer";
  const statusMeta = paymentStatusLabels[paymentStatus] || {
    label: paymentStatus,
    class: "bg-neutral-100 text-neutral-800 border-neutral-300"
  };

  const updatePayment = async (newPaymentStatus: string, newOrderStatus?: string) => {
    setLoadingAction(newPaymentStatus);
    setMessage(null);

    try {
      const payload: { paymentStatus: string; status?: string } = {
        paymentStatus: newPaymentStatus
      };
      if (newOrderStatus) {
        payload.status = newOrderStatus;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      setPaymentStatus(newPaymentStatus);
      setMessage({ type: "success", text: "Payment status updated" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Payment Verification</h2>
          <p className="text-xs text-neutral-500">
            Method: <span className="font-semibold uppercase text-neutral-800">{isBankTransfer ? "Bank Transfer" : "Cash on Delivery"}</span> • Due: Rs. {totalAmount.toLocaleString()}
          </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.class}`}>
          {statusMeta.label}
        </span>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${
          message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
        }`}>
          {message.text}
        </div>
      )}

      {isBankTransfer && (
        <div className="mt-5 space-y-4">
          {paymentReceipt ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="relative size-20 rounded-xl overflow-hidden border border-neutral-300 bg-white group shrink-0"
              >
                <Image src={paymentReceipt} alt="Receipt proof" fill className="object-cover group-hover:scale-105 transition" />
              </button>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-900">Payment Screenshot Uploaded</p>
                <p className="text-[11px] text-neutral-500">Customer attached a bank transfer transfer receipt.</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Inspect Full Receipt</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>No screenshot receipt attached by customer yet.</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => updatePayment("paid", "processing")}
              disabled={loadingAction !== null || paymentStatus === "paid"}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
            >
              <Check className="size-4" />
              <span>{loadingAction === "paid" ? "Verifying..." : "Approve & Mark Paid"}</span>
            </button>

            <button
              type="button"
              onClick={() => updatePayment("failed")}
              disabled={loadingAction !== null || paymentStatus === "failed"}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-40 text-xs font-bold rounded-xl transition"
            >
              <X className="size-4" />
              <span>{loadingAction === "failed" ? "Rejecting..." : "Decline Payment"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {modalOpen && paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-sm">Receipt Lightbox</span>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-500 hover:text-black">
                <X className="size-5" />
              </button>
            </div>
            <div className="relative h-96 w-full rounded-xl overflow-hidden bg-neutral-100">
              <Image src={paymentReceipt} alt="Proof" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
