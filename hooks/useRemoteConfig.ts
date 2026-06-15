"use client";

import { useState, useEffect } from "react";
import type { RemoteConfigValues } from "@/types";
import { fetchRemoteConfig } from "@/services/remoteConfig";
import { REMOTE_CONFIG_DEFAULTS } from "@/config/remoteConfig";

export function useRemoteConfig(): RemoteConfigValues {
  const [config, setConfig] = useState<RemoteConfigValues>(REMOTE_CONFIG_DEFAULTS);

  useEffect(() => {
    fetchRemoteConfig().then(setConfig);
  }, []);

  return config;
}
