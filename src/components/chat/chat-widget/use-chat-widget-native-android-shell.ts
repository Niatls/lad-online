"use client";

import { useEffect, useState } from "react";

type CapacitorWindow = typeof window & {
  Capacitor?: {
    getPlatform?: () => string;
    platform?: string;
  };
};

function isNativeAndroidShell() {
  if (typeof window === "undefined") {
    return false;
  }

  const capacitor = (window as CapacitorWindow).Capacitor;
  const platform = capacitor?.getPlatform?.() ?? capacitor?.platform;

  return platform === "android";
}

export function useChatWidgetNativeAndroidShell() {
  const [isNativeAndroid, setIsNativeAndroid] = useState(false);

  useEffect(() => {
    setIsNativeAndroid(isNativeAndroidShell());
  }, []);

  return isNativeAndroid;
}
