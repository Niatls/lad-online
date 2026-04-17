"use client";

import { useMemo } from "react";

export function useVoiceCallCounterpartLabel(role: "admin" | "visitor") {
  return useMemo(
    () => (role === "admin" ? "\u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u044f" : "\u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u0430"),
    [role],
  );
}
