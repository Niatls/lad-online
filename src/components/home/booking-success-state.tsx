"use client";

import { useState } from "react";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { BookingSubmissionResult } from "./booking-types";

type BookingSuccessStateProps = {
  submittedApplication: BookingSubmissionResult;
  onResetSuccess: () => void;
};

export function BookingSuccessState({
  submittedApplication,
  onResetSuccess,
}: BookingSuccessStateProps) {
  const [codeCopied, setCodeCopied] = useState(false);

  const copyApplicationCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          submittedApplication.applicationNumber,
        );
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = submittedApplication.applicationNumber;
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

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-light/40">
        <CheckCircle2 className="h-10 w-10 text-sage-dark" />
      </div>
      <h3 className="text-2xl font-bold text-forest">Заявка отправлена</h3>
      <p className="max-w-sm text-forest/50">
        За 20 минут до назначенного времени отправьте код в выбранный способ
        связи.
      </p>
      <button
        type="button"
        onClick={copyApplicationCode}
        className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm ring-1 ring-sage-light/20 transition hover:bg-sage-light/10 focus:outline-none focus:ring-2 focus:ring-sage"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-forest/35">
          Код заявки
        </p>
        <p className="mt-2 text-2xl font-bold text-sage-dark">
          {submittedApplication.applicationNumber}
        </p>
        <p className="mt-2 text-xs text-forest/45">
          {codeCopied ? "Скопировано" : "Нажмите, чтобы скопировать"}
        </p>
      </button>
      <p className="max-w-sm text-sm text-forest/50">
        Запись: {submittedApplication.preferredTime}. Канал:{" "}
        {submittedApplication.contactMethod}.
      </p>
      <a
        href={submittedApplication.contactHref}
        target={
          submittedApplication.contactHref.startsWith("#")
            ? undefined
            : "_blank"
        }
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-xl bg-sage px-5 text-sm font-semibold text-white transition hover:bg-sage-dark"
      >
        Перейти в {submittedApplication.contactMethod}
      </a>
      <Button
        type="button"
        variant="outline"
        onClick={onResetSuccess}
        className="rounded-xl border-sage-light/30 bg-white hover:bg-sage-light/10"
      >
        Отправить еще одну заявку
      </Button>
    </div>
  );
}
