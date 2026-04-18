"use client";

import { useEffect, useState } from "react";

type CapacitorWindow = typeof window & {
  Capacitor?: {
    getPlatform?: () => string;
    platform?: string;
  };
};

function isNativeMobileShell() {
  if (typeof window === "undefined") {
    return false;
  }

  const capacitor = (window as CapacitorWindow).Capacitor;
  const platform = capacitor?.getPlatform?.() ?? capacitor?.platform;

  return platform === "android" || platform === "ios";
}

export function useChatWidgetNativeMobileShell() {
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  useEffect(() => {
    setIsNativeMobile(isNativeMobileShell());
  }, []);

  return isNativeMobile;
}
