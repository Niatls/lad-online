"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type TimeColumnProps = {
  label: string;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
};

export function TimeColumn({
  label,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  emptyLabel = "Нет доступных значений",
}: TimeColumnProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sage-light/30 bg-white/80 select-none",
        disabled && "opacity-55"
      )}
    >
      <div className="border-b border-sage-light/20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-forest/40">
        {label}
      </div>
      <ScrollArea className="h-48">
        {options.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-forest/45">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option)}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                  selectedValue === option
                    ? "bg-sage text-white shadow-sm"
                    : "text-forest hover:bg-sage-light/15",
                  disabled && "pointer-events-none"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
