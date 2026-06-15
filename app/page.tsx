"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock3, MapPin } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ParkingCard } from "@/components/ParkingCard";
import { SaveFlow } from "@/components/SaveFlow";
import { ShareModal } from "@/components/ShareModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { ParkingHistory } from "@/components/ParkingHistory";
import { useParkingSpot } from "@/hooks/useParkingSpot";
import { useDistance } from "@/hooks/useDistance";
import { useRemoteConfig } from "@/hooks/useRemoteConfig";
import { Analytics } from "@/services/analytics";
import { fetchRemoteConfig } from "@/services/remoteConfig";

type Modal = "save" | "share" | "delete" | "history" | null;

export default function HomePage() {
  const { spot, loading, refresh, deleteSpot } = useParkingSpot();
  const { distanceText } = useDistance(spot?.latitude, spot?.longitude);
  const config = useRemoteConfig();
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    Analytics.appOpen();
    fetchRemoteConfig();
    const isFirstVisit = !localStorage.getItem("pp_visited");
    if (isFirstVisit) { Analytics.firstVisit(); localStorage.setItem("pp_visited", "1"); }
    else { Analytics.returnVisit(); }
  }, []);

  useEffect(() => { if (distanceText && spot) Analytics.distanceViewed(); }, [distanceText, spot]);
  useEffect(() => { if (spot) Analytics.parkingViewed(); }, [spot?.id]);

  const handleSaveSuccess = useCallback(() => { setModal(null); refresh(); }, [refresh]);
  const handleDeleteConfirm = useCallback(async () => {
    await deleteSpot(); Analytics.parkingDeleted(); setModal(null);
  }, [deleteSpot]);
  const handleReplace = useCallback(() => { setModal("save"); Analytics.parkingReplaced(); }, []);

  return (
    <div className="relative flex-1 flex flex-col min-h-screen overflow-hidden" style={{ background: "#07071a" }}>

      {/* ── Animated background orbs ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute w-80 h-80 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent 70%)",
            top: "-10%", left: "-15%",
            animation: "orbFloat1 14s ease-in-out infinite",
          }}
        />
        <div className="absolute w-72 h-72 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
            top: "30%", right: "-20%",
            animation: "orbFloat2 18s ease-in-out infinite",
          }}
        />
        <div className="absolute w-64 h-64 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #ec4899, transparent 70%)",
            bottom: "5%", left: "10%",
            animation: "orbFloat3 16s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Image src="/logo.svg" alt="PinPoint" width={36} height={36} priority />
          <span className="text-lg font-extrabold tracking-tight" style={{ color: "#f1f0ff" }}>
            PinPoint
          </span>
        </motion.div>

        {spot && config.show_parking_history && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setModal("history")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <Clock3 className="w-3.5 h-3.5" />
            History
          </motion.button>
        )}
      </header>

      {/* PWA banner */}
      <div className="relative z-10">
        <PWAInstallBanner />
      </div>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 px-4 pb-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <MapPin className="w-7 h-7" style={{ color: "#a5b4fc" }} />
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {spot ? (
              <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ParkingCard
                  spot={spot}
                  onDelete={() => setModal("delete")}
                  onShare={() => setModal("share")}
                  onReplace={handleReplace}
                  onViewHistory={config.show_parking_history ? () => setModal("history") : undefined}
                  showShareButton={config.show_share_button}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState onSave={() => setModal("save")} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === "save" && (
          <SaveFlow key="save-flow" onSuccess={handleSaveSuccess} onCancel={() => setModal(null)} />
        )}
      </AnimatePresence>

      {modal === "share" && spot && (
        <ShareModal spot={spot} distanceText={distanceText ?? undefined}
          showQrShare={config.show_qr_share} onClose={() => setModal(null)} />
      )}

      <ConfirmDialog
        open={modal === "delete"}
        title="Delete parking spot?"
        description="Your saved location will be removed. You can always pin a new one."
        confirmLabel="Delete" cancelLabel="Keep it" destructive
        onConfirm={handleDeleteConfirm} onCancel={() => setModal(null)}
      />

      {/* Footer */}
      {!modal && !loading && (
        <footer className="relative z-10 pb-safe pb-4 pt-2 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
            Built by Aswin, Claude &amp; Coffee ☕ ·{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-60 transition-opacity">
              Privacy
            </Link>
          </p>
        </footer>
      )}

      {/* History sheet */}
      <AnimatePresence>
        {modal === "history" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.target === e.currentTarget && setModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="w-full rounded-t-3xl max-h-[80vh] overflow-y-auto"
              style={{ background: "#0f0e2a", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
              </div>
              <div className="px-6 py-4">
                <h2 className="text-lg font-bold mb-4" style={{ color: "#f1f0ff" }}>Parking History</h2>
                <ParkingHistory />
              </div>
              <div className="pb-safe pb-8" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
