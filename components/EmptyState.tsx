"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { Analytics } from "@/services/analytics";

interface EmptyStateProps {
  onSave: () => void;
}

const SPARKLES = [
  { top: "18%", left: "12%",  size: 10, delay: 0.0, dur: 2.4 },
  { top: "10%", left: "78%",  size: 8,  delay: 0.6, dur: 2.9 },
  { top: "72%", left: "8%",   size: 12, delay: 1.1, dur: 2.1 },
  { top: "68%", left: "84%",  size: 9,  delay: 0.3, dur: 3.1 },
  { top: "40%", left: "90%",  size: 7,  delay: 1.5, dur: 2.7 },
  { top: "85%", left: "55%",  size: 11, delay: 0.8, dur: 2.3 },
  { top: "25%", left: "50%",  size: 6,  delay: 1.8, dur: 3.4 },
];

const TAGS = ["Malls", "Exhibitions", "Mountain Trails", "Forest Roads", "Airports", "Events"];

export function EmptyState({ onSave }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center px-6 py-8 min-h-[75dvh] overflow-hidden">

      {/* ── Floating sparkles ─────────────────────────────────── */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 12 12">
            <path
              d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z"
              fill="url(#sg)"
            />
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* ── Pin illustration ───────────────────────────────────── */}
      <div className="relative mb-10 mt-4">
        {/* Ripple rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: "1.5px solid rgba(165,180,252,0.35)" }}
            animate={{ scale: [0.85, 2.4], opacity: [0.7, 0] }}
            transition={{
              duration: 2.4,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Pin container */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 flex items-center justify-center"
        >
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
          />
          <Image src="/logo.svg" alt="PinPoint" width={120} height={120} priority />
        </motion.div>

        {/* Shadow blob */}
        <motion.div
          animate={{ scaleX: [1, 0.78, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full blur-md"
          style={{ background: "rgba(139,92,246,0.5)" }}
        />
      </div>

      {/* ── Copy ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h1 className="text-[2rem] font-extrabold leading-tight mb-4 tracking-tight">
          <span className="gradient-text">Never lose track</span>
          <br />
          <span style={{ color: "#f1f0ff" }}>of your vehicle.</span>
        </h1>

        <p className="text-sm leading-relaxed mb-2 max-w-xs mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
          Malls, exhibitions, mountain trails, forest roads —
          PinPoint remembers so you don&apos;t have to.
        </p>
      </motion.div>

      {/* ── Scrolling tag pills ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 flex-wrap justify-center mt-5 mb-10 max-w-xs"
      >
        {TAGS.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.07 }}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* ── CTA button ────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => { Analytics.saveSpotClicked(); onSave(); }}
        className="btn-gradient relative w-full max-w-xs rounded-2xl py-4 px-8 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-2xl"
        style={{ boxShadow: "0 8px 32px rgba(139,92,246,0.45)" }}
      >
        <MapPin className="w-5 h-5" />
        Save Parking Spot
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-5 text-xs"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Works offline · No account needed · Free forever
      </motion.p>

      <motion.blockquote
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 max-w-xs text-center px-4 py-4 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-sm italic leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
          &ldquo;Not all those who wander are lost.<br />
          Some just forgot where they parked.&rdquo;
        </p>
        <p className="text-xs mt-2 font-semibold tracking-wide" style={{ color: "rgba(165,180,252,0.55)" }}>
          — J.R.R. Tolkien (probably)
        </p>
      </motion.blockquote>
    </div>
  );
}
