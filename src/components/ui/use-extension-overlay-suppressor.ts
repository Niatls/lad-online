"use client";

import * as React from "react";

type SuppressibleField = HTMLInputElement | HTMLTextAreaElement;

const EXTENSION_MARKERS = [
  "deepl",
  "grammarly",
  "language",
  "translate",
  "translation",
  "proof",
  "writing",
  "cofdbpoegempjloogbagkncekinflcnj",
];

function overlapsFocusedField(candidateRect: DOMRect, targetRect: DOMRect) {
  return (
    candidateRect.left <= targetRect.right + 140 &&
    candidateRect.right >= targetRect.left &&
    candidateRect.top <= targetRect.bottom + 28 &&
    candidateRect.bottom >= targetRect.top - 28
  );
}

function hidesLikeOverlay(element: HTMLElement, target: SuppressibleField) {
  if (
    !element.isConnected ||
    element === target ||
    element.contains(target) ||
    target.contains(element) ||
    element.closest("[data-custom-paste-menu-root='true']") ||
    element.dataset.codexExtensionOverlayHidden === "true"
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.width > 320 || rect.height > 140) {
    return false;
  }

  if (!overlapsFocusedField(rect, targetRect)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const isFloating =
    style.position === "fixed" ||
    style.position === "absolute" ||
    style.position === "sticky" ||
    Number(style.zIndex || 0) >= 100;

  if (!isFloating || style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const markerText = [
    element.id,
    element.className,
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.textContent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (EXTENSION_MARKERS.some((marker) => markerText.includes(marker))) {
    return true;
  }

  const buttonCount = element.querySelectorAll("button").length;
  const svgCount = element.querySelectorAll("svg").length;
  return buttonCount >= 2 && buttonCount <= 6 && svgCount >= 1;
}

function hideLikelyOverlays(target: SuppressibleField) {
  for (const element of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    if (!hidesLikeOverlay(element, target)) {
      continue;
    }

    element.dataset.codexExtensionOverlayHidden = "true";
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("pointer-events", "none", "important");
    element.setAttribute("aria-hidden", "true");
  }
}

export function useExtensionOverlaySuppressor() {
  const activeTargetRef = React.useRef<SuppressibleField | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const stop = React.useCallback(() => {
    activeTargetRef.current = null;
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    document.body.removeAttribute("data-hide-extension-overlays");
  }, []);

  const suppress = React.useCallback(() => {
    const target = activeTargetRef.current;
    if (!target || !target.isConnected) {
      stop();
      return;
    }

    hideLikelyOverlays(target);
  }, [stop]);

  const start = React.useCallback(
    (target: SuppressibleField) => {
      activeTargetRef.current = target;
      document.body.setAttribute("data-hide-extension-overlays", "true");
      suppress();

      observerRef.current?.disconnect();
      observerRef.current = new MutationObserver(() => suppress());
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => suppress(), 300);
    },
    [suppress],
  );

  React.useEffect(() => stop, [stop]);

  return {
    handleBlur: stop,
    handleFocus: (event: React.FocusEvent<SuppressibleField>) => {
      start(event.currentTarget);
    },
  };
}
