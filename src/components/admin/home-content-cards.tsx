"use client";

import type React from "react";
import { Grip, Plus, Trash2 } from "lucide-react";

export function Card({
  title,
  action,
  children,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-sage-light/20 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-forest">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ItemCard({
  title,
  icon: Icon,
  onRemove,
  disableRemove,
  children,
}: {
  children: React.ReactNode;
  disableRemove?: boolean;
  icon: typeof Grip;
  onRemove: () => void;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-sage-light/20 bg-cream/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-forest/60">
          <Icon className="h-4 w-4" />
          {title}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disableRemove}
          className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function ActionButton({
  label,
  onClick,
  icon: Icon,
  disabled,
}: {
  disabled?: boolean;
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
