"use client";

import type React from "react";

import { LoaderCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LookupFormProps = {
  applicationCode: string;
  appointment: {
    day: number;
    monthIndex: number;
    time: string;
    year: number;
  } | null;
  calendarMonthName: string;
  contactHref?: string;
  contactMethod?: string;
  error: string;
  isLoading: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  resultNumber?: string;
};

export function LookupForm({
  applicationCode,
  appointment,
  calendarMonthName,
  contactHref,
  contactMethod,
  error,
  isLoading,
  onCodeChange,
  onSubmit,
  resultNumber,
}: LookupFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      autoComplete="off"
      className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_auto]"
      onContextMenuCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, textarea")) {
          return;
        }

        event.preventDefault();
      }}
    >
      <Input
        aria-label="Код заявки"
        name="lookup_code"
        autoComplete="off"
        placeholder="LAD-NG6GDW-K05"
        value={applicationCode}
        onChange={(event) => onCodeChange(event.target.value)}
        className="h-11 select-text rounded-xl border-white/60 bg-white/70 placeholder:text-forest/28"
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        onContextMenu={(event) => event.preventDefault()}
        className="h-11 rounded-xl bg-sage px-4 text-white hover:bg-sage-dark"
      >
        {isLoading ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        Найти
      </Button>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
          {error}
        </p>
      ) : null}

      {resultNumber ? (
        <div className="rounded-xl border border-white/50 bg-white/55 px-4 py-3 text-sm text-forest backdrop-blur-sm sm:col-span-2">
          <p className="font-semibold">
            {resultNumber}:{" "}
            {appointment
              ? `${appointment.day} ${calendarMonthName}, ${appointment.time} МСК`
              : "дата ещё уточняется"}
          </p>
          {contactHref && contactMethod ? (
            <a
              href={contactHref}
              target={contactHref.startsWith("#") ? undefined : "_blank"}
              rel="noreferrer"
              className="mt-1 inline-flex text-sage-dark underline-offset-4 hover:underline"
            >
              Перейти в {contactMethod}
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
