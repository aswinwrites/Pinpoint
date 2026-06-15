import Link from "next/link";
import { MapPin, ShieldCheck, HardDrive, Wifi, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy – PinPoint",
  description: "PinPoint collects no personal data. Everything stays on your device.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07071a" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-10 pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
            }}
          >
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: "#f1f0ff" }}>
            PinPoint
          </span>
        </Link>
      </header>

      <main className="flex-1 px-6 pb-16 max-w-md mx-auto w-full">
        <h1
          className="text-3xl font-extrabold mb-2 tracking-tight"
          style={{ color: "#f1f0ff" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>
          Last updated: June 2026
        </p>

        {/* TL;DR card */}
        <div
          className="rounded-2xl p-5 mb-8 flex gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
            border: "1px solid rgba(165,180,252,0.2)",
          }}
        >
          <ShieldCheck className="w-8 h-8 shrink-0 mt-0.5" style={{ color: "#a5b4fc" }} />
          <div>
            <p className="font-bold mb-1" style={{ color: "#f1f0ff" }}>
              The short version: we collect nothing.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              PinPoint stores your parking data locally on your device only. No servers, no accounts, no tracking.
            </p>
          </div>
        </div>

        {/* Sections */}
        {[
          {
            icon: <HardDrive className="w-5 h-5" style={{ color: "#a5b4fc" }} />,
            title: "All data stays on your device",
            body: "Your parking locations, photos, and notes are saved exclusively in your browser's local storage (IndexedDB). This data never leaves your device and is never transmitted to any server.",
          },
          {
            icon: <Lock className="w-5 h-5" style={{ color: "#a5b4fc" }} />,
            title: "No personal data collected",
            body: "PinPoint does not collect, store, or process any personal information — no name, email, phone number, account, or profile of any kind. We don't know who you are, and we prefer it that way.",
          },
          {
            icon: <Wifi className="w-5 h-5" style={{ color: "#a5b4fc" }} />,
            title: "No cookies or third-party trackers",
            body: "We use no advertising cookies, no cross-site trackers, and no third-party analytics that identify individual users. The app works fully offline after the first load.",
          },
          {
            icon: <ShieldCheck className="w-5 h-5" style={{ color: "#a5b4fc" }} />,
            title: "GPS is used locally, never shared",
            body: "When you tap 'Use My Location', your GPS coordinates are read by your browser and saved only to your device's local storage. Your coordinates are never sent anywhere.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="mb-7">
            <div className="flex items-center gap-2.5 mb-2">
              {icon}
              <h2 className="font-bold text-base" style={{ color: "#f1f0ff" }}>
                {title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed pl-8" style={{ color: "rgba(255,255,255,0.5)" }}>
              {body}
            </p>
          </div>
        ))}

        <div
          className="rounded-2xl p-5 mt-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Questions? PinPoint is a personal project. Since we hold no data about you, there's nothing to request, correct, or delete — it's all on your device. Clear your browser storage to erase everything.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Built by Aswin, Claude &amp; Coffee ☕
        </p>
      </footer>
    </div>
  );
}
