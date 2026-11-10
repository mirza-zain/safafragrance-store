'use client';

import { useState } from "react";

type StatusControlProps = {
  orderId: number;
  initialStatus: string;
};

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StatusControl({ orderId, initialStatus }: StatusControlProps) {
  const [status, setStatus] = useState(initialStatus.toLowerCase());
  const [savedStatus, setSavedStatus] = useState(initialStatus.toLowerCase());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Unable to update order status");

      setSavedStatus(status);
      setMessage("Status updated");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <label htmlFor="order-status" className="text-sm font-medium text-neutral-600">
        Update status
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id="order-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setMessage(null);
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-black"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={updateStatus}
          disabled={saving || status === savedStatus}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {message && <p className="text-xs text-neutral-500">{message}</p>}
    </div>
  );
}
