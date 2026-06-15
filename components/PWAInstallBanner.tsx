"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Share, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!standalone && isIOS()) setIos(true);
  }, []);

  if (isInstalled || dismissed) return null;

  // Android/Chrome — native prompt
  if (isInstallable) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mx-4 mb-4 rounded-2xl flex items-center gap-3 px-4 py-3"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(165,180,252,0.25)",
          }}
        >
          <Plus className="w-5 h-5 shrink-0" style={{ color: "#a5b4fc" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#f1f0ff" }}>Add to Home Screen</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Works offline, instant access</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerInstall}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }}
            >
              Add
            </button>
            <button onClick={() => setDismissed(true)} style={{ color: "rgba(255,255,255,0.35)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // iOS Safari — manual instructions
  if (ios && !showIosTip) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mx-4 mb-4 rounded-2xl flex items-center gap-3 px-4 py-3"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(165,180,252,0.25)",
          }}
        >
          <Share className="w-5 h-5 shrink-0" style={{ color: "#a5b4fc" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#f1f0ff" }}>Add to Home Screen</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Tap for instructions</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowIosTip(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }}
            >
              How?
            </button>
            <button onClick={() => setDismissed(true)} style={{ color: "rgba(255,255,255,0.35)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (ios && showIosTip) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mx-4 mb-4 rounded-2xl px-5 py-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(165,180,252,0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: "#f1f0ff" }}>Add to Home Screen</p>
            <button onClick={() => setDismissed(true)} style={{ color: "rgba(255,255,255,0.35)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <ol className="space-y-1.5">
            {[
              <>Tap the <Share className="inline w-3.5 h-3.5 mb-0.5" /> Share button below</>,
              <>Scroll down and tap <strong style={{ color: "#f1f0ff" }}>"Add to Home Screen"</strong></>,
              <>Tap <strong style={{ color: "#f1f0ff" }}>Add</strong> — done!</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span
                  className="shrink-0 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: "rgba(165,180,252,0.2)", color: "#a5b4fc" }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
