"use client";

import { useState } from "react";

export function useCopyApplicationCode(applicationNumber: string) {
  const [codeCopied, setCodeCopied] = useState(false);

  const copyApplicationCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(applicationNumber);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = applicationNumber;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      setCodeCopied(false);
    }
  };

  return {
    codeCopied,
    copyApplicationCode,
  };
}
