'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import logo from "@/public/logo.png";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@safa.com");
  const [password, setPassword] = useState("@Safa,786");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      // Successfully authenticated
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@safa.com");
    setPassword("@Safa,786");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#faf7f2] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e7decb] relative overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1b4431] via-[#b39b66] to-[#1b4431]" />

        {/* Brand Crest & Heading */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <Link href="/" className="transition-transform hover:scale-105" aria-label="Safa Fragrance">
            <Image
              src={logo}
              alt="Safa Fragrance"
              priority
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#0e281d]">
              Executive Console
            </h1>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">
              Better Auth & Neon Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@safa.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-[#1b4431] focus:ring-1 focus:ring-[#1b4431] text-sm text-neutral-900 bg-neutral-50/50 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-[#1b4431] focus:ring-1 focus:ring-[#1b4431] text-sm text-neutral-900 bg-neutral-50/50 outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1b4431] hover:bg-[#0e281d] text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Fill Helper */}
        <div className="mt-5 pt-5 border-t border-neutral-100 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full py-2 px-3 rounded-lg border border-[#e7decb] bg-[#faf7f2]/70 hover:bg-[#f2ece2] text-[11px] font-medium text-[#1b4431] flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles size={13} className="text-[#b39b66]" />
            <span>Use Default Credentials (admin@safa.com)</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Neon PostgreSQL Protected</span>
            </span>
            <Link href="/" className="hover:text-neutral-900 underline transition">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
