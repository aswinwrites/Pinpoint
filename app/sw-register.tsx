"use client";

import { useEffect } from "react";

/** Registers the service worker. Call once from layout or root page. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[ParkPin SW] registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[ParkPin SW] registration failed:", err);
        });
    });
  }, []);

  return null;
}
