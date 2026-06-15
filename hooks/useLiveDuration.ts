"use client";

import { useState, useEffect } from "react";
import { formatParkedAgo } from "@/lib/utils";

/** Auto-updates every 60s. Returns "Parked 2h 34m ago" */
export function useLiveDuration(timestamp?: number): string {
  const [text, setText] = useState(() =>
    timestamp ? formatParkedAgo(timestamp) : ""
  );

  useEffect(() => {
    if (!timestamp) return;
    setText(formatParkedAgo(timestamp));

    const interval = setInterval(() => {
      setText(formatParkedAgo(timestamp));
    }, 60_000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return text;
}
