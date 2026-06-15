"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Share2, MessageCircle, Copy, Download, Image as ImageIcon,
  Loader2, Check, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { generateShareCard } from "@/lib/shareCard";
import { buildShareMessage, buildWhatsAppUrl, buildMapsLink } from "@/lib/utils";
import { Analytics } from "@/services/analytics";
import type { ParkingSpot } from "@/types";

interface ShareModalProps {
  spot: ParkingSpot;
  distanceText?: string;
  showQrShare: boolean;
  onClose: () => void;
}

type ShareView = "menu" | "card";

export function ShareModal({ spot, distanceText, showQrShare, onClose }: ShareModalProps) {
  const [view, setView] = useState<ShareView>("menu");
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Fire once on open
  useEffect(() => { Analytics.shareClicked(); }, []);

  const shareMessage = buildShareMessage(
    spot.latitude,
    spot.longitude,
    spot.timestamp,
    spot.note
  );

  // ── Web Share API ─────────────────────────────────────────────────────────
  const handleWebShare = useCallback(async () => {
    if (!navigator.share) {
      handleWhatsApp();
      return;
    }
    try {
      await navigator.share({
        title: "My Parking Spot – PinPoint",
        text: shareMessage,
        url: buildMapsLink(spot.latitude, spot.longitude),
      });
      Analytics.shareSuccess("web_share", false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        Analytics.shareFailed("web_share_error");
        showToast("Could not share. Try WhatsApp.", "error");
      }
    }
  }, [shareMessage, spot, showToast]);

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const handleWhatsApp = useCallback(async () => {
    // If there's a parking photo and the browser supports file sharing,
    // use the Web Share API so the image goes directly into WhatsApp.
    if (spot.photo && navigator.canShare) {
      try {
        const blob = await (await fetch(spot.photo)).blob();
        const file = new File([blob], "pinpoint-spot.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            text: shareMessage,
            title: "My Parking Spot – PinPoint",
          });
          Analytics.shareSuccess("whatsapp", true);
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Fall through to URL scheme
      }
    }
    // Fallback: text-only WhatsApp URL scheme
    window.open(buildWhatsAppUrl(shareMessage), "_blank", "noopener");
    Analytics.shareSuccess("whatsapp", false);
  }, [spot.photo, shareMessage]);

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      showToast("Message copied!", "success");
      Analytics.shareSuccess("copy", false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy to clipboard.", "error");
      Analytics.shareFailed("copy_failed");
    }
  }, [shareMessage, showToast]);

  // ── Share card ────────────────────────────────────────────────────────────
  const handleGenerateCard = useCallback(async () => {
    setGeneratingCard(true);
    setView("card");
    try {
      const dataUrl = await generateShareCard(spot, distanceText);
      setCardDataUrl(dataUrl);
      Analytics.shareImageGenerated();
    } catch {
      showToast("Couldn't generate share card.", "error");
      setView("menu");
    } finally {
      setGeneratingCard(false);
    }
  }, [spot, distanceText, showToast]);

  const handleDownloadCard = useCallback(() => {
    if (!cardDataUrl) return;
    const a = document.createElement("a");
    a.href = cardDataUrl;
    a.download = `parkpin-${Date.now()}.png`;
    a.click();
    Analytics.shareSuccess("image_download", true);
  }, [cardDataUrl]);

  const handleShareCard = useCallback(async () => {
    if (!cardDataUrl || !navigator.share) {
      handleDownloadCard();
      return;
    }
    try {
      const blob = await (await fetch(cardDataUrl)).blob();
      const file = new File([blob], "parkpin-spot.png", { type: "image/png" });
      await navigator.share({ files: [file], title: "My Parking Spot – PinPoint" });
      Analytics.shareSuccess("image_share", true);
    } catch {
      handleDownloadCard();
    }
  }, [cardDataUrl, handleDownloadCard]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="w-full rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          style={{ background: "#0f0e2a", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold" style={{ color: "#f1f0ff" }}>
              {view === "card" ? "Share Card" : "Share Parking Spot"}
            </h2>
            <button
              onClick={view === "card" ? () => setView("menu") : onClose}
              className="p-2 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {view === "menu" && (
            <div className="px-6 pb-10 space-y-3">
              {/* Share message preview */}
              <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {shareMessage}
                </p>
              </div>

              {/* Primary: native share */}
              <motion.button whileTap={{ scale: 0.97 }}
                className="btn-gradient w-full rounded-2xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}
                onClick={handleWebShare}
              >
                <Share2 className="w-4 h-4" /> Share Parking Spot
              </motion.button>

              {/* WhatsApp */}
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full rounded-2xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "#25D366", boxShadow: "0 6px 20px rgba(37,211,102,0.3)" }}
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </motion.button>

              {/* Share card (with QR) */}
              {showQrShare && (
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#a5b4fc" }}
                  onClick={handleGenerateCard}
                  disabled={generatingCard}
                >
                  {generatingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  Generate Share Card
                </motion.button>
              )}

              {/* Copy */}
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                onClick={handleCopy}
              >
                {copied ? (
                  <><Check className="w-4 h-4" style={{ color: "#34d399" }} /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Message</>
                )}
              </motion.button>
            </div>
          )}

          {view === "card" && (
            <div className="px-6 pb-10">
              {generatingCard ? (
                <div className="flex flex-col items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: "#a5b4fc" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Generating your share card…</p>
                </div>
              ) : cardDataUrl ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl overflow-hidden shadow-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cardDataUrl} alt="Share card" className="w-full" />
                  </motion.div>

                  <motion.button whileTap={{ scale: 0.97 }}
                    className="btn-gradient w-full rounded-2xl py-4 text-white font-bold text-sm flex items-center justify-center gap-2"
                    onClick={handleShareCard}
                  >
                    <Share2 className="w-4 h-4" /> Share Card
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                    onClick={handleDownloadCard}
                  >
                    <Download className="w-4 h-4" /> Download PNG
                  </motion.button>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
