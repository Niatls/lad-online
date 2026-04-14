import type React from "react";

import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import type { HomeContactsContent } from "@/lib/content";

type BookingContactInfoProps = {
  contacts: HomeContactsContent;
  onActivateCopyTarget: (node: HTMLElement | null) => void;
  phoneTextRef: React.RefObject<HTMLParagraphElement | null>;
  emailTextRef: React.RefObject<HTMLParagraphElement | null>;
};

type ContactCardProps = {
  Icon: LucideIcon;
  label: string;
  value: string;
  copyRef?: React.RefObject<HTMLParagraphElement | null>;
  onActivateCopyTarget?: (node: HTMLElement | null) => void;
  breakAll?: boolean;
};

function ContactCard({
  Icon,
  label,
  value,
  copyRef,
  onActivateCopyTarget,
  breakAll = false,
}: ContactCardProps) {
  const copyProps = copyRef
    ? {
        ref: copyRef,
        onMouseDown: (event: React.MouseEvent<HTMLParagraphElement>) =>
          event.preventDefault(),
        onDoubleClick: () => onActivateCopyTarget?.(copyRef.current),
        "data-copy-text": value,
        "data-copy-active": "false",
      }
    : {};

  return (
    <div className="flex items-center gap-4 rounded-xl border border-sage-light/20 bg-cream p-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light/30">
        <Icon className="h-5 w-5 text-sage-dark" />
      </div>
      <div>
        <p className="mb-0.5 text-xs text-forest/40">{label}</p>
        <p
          {...copyProps}
          className={[
            "select-none text-sm font-semibold text-forest",
            breakAll ? "break-all" : "",
            copyRef
              ? "data-[copy-active=true]:rounded-md data-[copy-active=true]:bg-sage-light/40 data-[copy-active=true]:px-1.5 data-[copy-active=true]:py-0.5"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function BookingContactInfo({
  contacts,
  onActivateCopyTarget,
  phoneTextRef,
  emailTextRef,
}: BookingContactInfoProps) {
  return (
    <div className="space-y-4">
      <ContactCard
        Icon={Phone}
        label="Телефон"
        value={contacts.phone}
        copyRef={phoneTextRef}
        onActivateCopyTarget={onActivateCopyTarget}
      />
      <ContactCard
        Icon={Mail}
        label="Электронная почта"
        value={contacts.email}
        copyRef={emailTextRef}
        onActivateCopyTarget={onActivateCopyTarget}
        breakAll
      />
      <ContactCard Icon={MapPin} label="Формат" value={contacts.formatLabel} />
    </div>
  );
}
