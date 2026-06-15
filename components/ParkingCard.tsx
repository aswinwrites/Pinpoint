"use client";

import { motion } from "framer-motion";
import { Navigation, Share2, Trash2, MapPin, Clock, FileText, History, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useDistance } from "@/hooks/useDistance";
import { useLiveDuration } from "@/hooks/useLiveDuration";
import { mapsUrl } from "@/lib/geolocation";
import { formatTimestamp, vehicleEmoji as vEmoji } from "@/lib/utils";
import { Analytics } from "@/services/analytics";
import type { ParkingSpot } from "@/types";

interface ParkingCardProps {
  spot: ParkingSpot;
  onDelete: () => void;
  onShare: () => void;
  onReplace: () => void;
  onViewHistory?: () => void;
  showShareButton: boolean;
}

export function ParkingCard({ spot, onDelete, onShare, onReplace, onViewHistory, showShareButton }: ParkingCardProps) {
  const { distanceText } = useDistance(spot.latitude, spot.longitude);
  const durationText = useLiveDuration(spot.timestamp);

  const handleNavigate = () => {
    Analytics.navigationStarted();
    window.open(mapsUrl(spot.latitude, spot.longitude), "_blank", "noopener");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="w-full pt-2"
    >
      {/* ── Photo / hero ─────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-4"
        style={{ height: "clamp(180px, 45vw, 260px)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {spot.photo ? (
          <Image src={spot.photo} alt="Parking spot" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))" }}
          >
            <span className="text-7xl mb-2">{vEmoji(spot.vehicleType)}</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>No photo taken</span>
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(7,7,26,0.9), transparent)" }}
        />

        {/* Chips top */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold glass"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {vEmoji(spot.vehicleType)} {spot.vehicleName || spot.vehicleType}
          </span>
          {distanceText && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              style={{
                background: "rgba(52,211,153,0.2)",
                border: "1px solid rgba(52,211,153,0.4)",
                color: "#34d399",
              }}
            >
              <MapPin className="w-3 h-3" />{distanceText}
            </motion.span>
          )}
        </div>

        {/* Duration bottom-left */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
          <span className="text-sm font-semibold" style={{ color: "#f1f0ff" }}>{durationText}</span>
        </div>
      </div>

      {/* ── Info card ────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-4 mb-4 space-y-3">
        {/* Note */}
        {spot.note && (
          <div className="flex items-start gap-2.5 rounded-2xl px-3 py-2.5"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
          >
            <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
            <span className="text-sm font-semibold" style={{ color: "#fde68a" }}>{spot.note}</span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
            {formatTimestamp(spot.timestamp)}
          </span>
          <span className="text-xs font-mono shrink-0" style={{ color: "rgba(255,255,255,0.22)" }}>
            {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleNavigate}
        className="btn-gradient w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2.5 mb-3"
        style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
      >
        <Navigation className="w-5 h-5" />
        Navigate Back
      </motion.button>

      <div className="flex gap-2.5">
        {showShareButton && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={onShare}
            className="glass flex-1 rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
            style={{ color: "#a5b4fc" }}
          >
            <Share2 className="w-4 h-4" /> Share
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.95 }} onClick={onReplace}
          className="glass flex-1 rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <RefreshCw className="w-4 h-4" /> Replace
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onDelete}
          className="rounded-2xl px-4 py-3 flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {onViewHistory && (
        <button onClick={onViewHistory}
          className="flex items-center gap-1.5 text-xs mx-auto mt-4"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          <History className="w-3.5 h-3.5" /> View parking history
        </button>
      )}
    </motion.div>
  );
}
