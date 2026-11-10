'use client';

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 space-y-3">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b39b66]">
          Safa Fragrance Concierge
        </span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase text-neutral-900 font-serif leading-[1.05]">
          Speak With Our <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4431] to-[#b39b66]">
            Olfactory Concierge
          </span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed pt-2">
          Whether you desire tailored scent guidance, have inquiries about an active parcel, or wish to schedule a private decant consultation in Karachi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Direct Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
              <div className="size-10 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-center text-[#1b4431]">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Direct Inquiries</p>
                <p className="text-base font-bold text-neutral-900 font-serif">concierge@safafragrance.com</p>
                <p className="text-xs text-neutral-500 mt-0.5">Average reply time within 3 hours</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
              <div className="size-10 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-center text-[#1b4431]">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Direct Helpline & WhatsApp</p>
                <p className="text-base font-bold text-neutral-900 font-serif">+92 300 1234567</p>
                <p className="text-xs text-neutral-500 mt-0.5">Mon–Sat • 10:00 AM – 9:00 PM PKT</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e5dbc7] shadow-xs space-y-3">
              <div className="size-10 rounded-2xl bg-[#faf7f2] border border-[#e5dbc7] flex items-center justify-center text-[#1b4431]">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Karachi Studio & Showroom</p>
                <p className="text-base font-bold text-neutral-900 font-serif">Phase 6, DHA, Karachi</p>
                <p className="text-xs text-neutral-500 mt-0.5">Private olfactory consultations by appointment</p>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action */}
          <div className="p-6 rounded-3xl bg-[#1b4431] text-[#f2ece2] space-y-3 shadow-xl">
            <h3 className="text-lg font-bold font-serif text-[#d8c38c]">Instant WhatsApp Support</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Need immediate advice on longevity, note comparisons, or bank transfer verification?
            </p>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#b39b66] hover:bg-[#d8c38c] text-[#0f271c] font-bold text-xs uppercase tracking-widest transition shadow-md"
            >
              <MessageSquare size={16} />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 border border-[#e5dbc7] shadow-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold uppercase font-serif text-neutral-900">
              Send An Inquiry
            </h2>
            <p className="text-xs text-neutral-500">
              Our master concierge reviews every transmission personally.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 size={36} className="text-emerald-700 mx-auto" />
              <h3 className="text-xl font-bold font-serif text-emerald-900">Inquiry Received</h3>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Thank you, {form.name}. A representative from our Karachi concierge team will contact you shortly via email or phone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Zubair Ahmed"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="zubair@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Nature of Inquiry
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                  >
                    <option value="Order Inquiry">Active Order Inquiry</option>
                    <option value="Scent Guidance">Personal Scent Guidance</option>
                    <option value="Bank Verification">Payment Proof Verification</option>
                    <option value="Wholesale">Wholesale & Corporate Gifting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we may assist you..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e5dbc7] bg-[#faf7f2] text-sm focus:outline-hidden focus:border-[#1b4431]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#1b4431] hover:bg-[#123023] text-white font-bold text-xs uppercase tracking-widest transition shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Send Message to Concierge</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

