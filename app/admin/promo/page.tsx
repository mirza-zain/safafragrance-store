"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Upload } from "lucide-react";

type Promo = {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  updatedAt: string;
};

export default function PromoAdminPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/site-promo", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        const promo: Promo | null = data.promo ?? null;
        if (promo) {
          setImageUrl(promo.imageUrl || "");
          setLinkUrl(promo.linkUrl || "");
          setIsActive(Boolean(promo.isActive));
        }
      } catch {
        if (!cancelled) setError("Failed to load promo settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUpload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to upload image");
      if (typeof json.url !== "string" || !json.url) throw new Error("No image URL returned");
      setImageUrl(json.url);
      setSuccess("Image uploaded. Save promo settings to publish.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!imageUrl.trim()) {
      setError("Promo image is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/site-promo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          linkUrl: linkUrl.trim(),
          isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save promo");
      setSuccess(isActive ? "Promo saved and enabled." : "Promo saved (currently disabled).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save promo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-3xl font-bold font-serif text-neutral-900">Promo Popup</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the promotional popup shown on the store. Enable it for live campaigns and disable it when the campaign ends.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Show promo popup on store</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Disable to hide it without deleting the image or link.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span className="text-sm font-medium text-neutral-700">{isActive ? "Enabled" : "Disabled"}</span>
          </label>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Promo Image
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium hover:border-black transition">
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <span>{uploading ? "Uploading..." : "Upload image"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  handleUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-neutral-500">JPEG, PNG, WebP, GIF up to 5 MB</span>
          </div>

          <div className="mt-3">
            <label htmlFor="imageUrl" className="mb-1 block text-xs font-medium text-neutral-500">
              Image URL or path
            </label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/images/ad.jpg or https://..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          {imageUrl.trim() && (
            <div className="mt-4 inline-block rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-2 text-xs font-medium text-neutral-500">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Promo preview"
                className="max-h-80 w-auto rounded-lg bg-white object-contain"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="linkUrl" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Link URL (optional)
          </label>
          <input
            id="linkUrl"
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://... or /shop"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            If set, clicking the popup image opens this link in a new tab.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800 disabled:opacity-50 active:scale-[0.99]"
          >
            {saving ? "Saving..." : "Save Promo Settings"}
          </button>
        </div>
      </form>
    </main>
  );
}
