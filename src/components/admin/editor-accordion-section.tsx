"use client";

import type React from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type EditorAccordionSectionProps = {
  children: React.ReactNode;
  description: string;
  title: string;
  value: string;
};

export function EditorAccordionSection({
  children,
  description,
  title,
  value,
}: EditorAccordionSectionProps) {
  return (
    <AccordionItem
      value={value}
      className="rounded-[1.5rem] border border-sage-light/20 bg-white px-5"
    >
      <AccordionTrigger className="py-5 no-underline hover:no-underline">
        <span className="block text-left">
          <span className="block text-base font-semibold text-forest">
            {title}
          </span>
          <span className="mt-1 block text-sm font-normal leading-6 text-forest/55">
            {description}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-5">{children}</AccordionContent>
    </AccordionItem>
  );
}
