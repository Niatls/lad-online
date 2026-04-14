"use client";

import { useRef } from "react";

import { FadeIn } from "./fade-in";
import { BookingContactInfo } from "./booking-contact-info";
import { BookingForm } from "./booking-form";
import { BookingSuccessState } from "./booking-success-state";
import type {
  BookingFieldChangeHandler,
  BookingFormData,
  BookingSubmissionResult,
  BookingSubmitHandler,
} from "./booking-types";
import type { HomeContactsContent, HomePageContent } from "@/lib/content";

export type { BookingFormData, BookingSubmissionResult } from "./booking-types";

type BookingSectionProps = {
  content: HomePageContent;
  contacts: HomeContactsContent;
  formData: BookingFormData;
  isSubmitting: boolean;
  submitError: string;
  submittedApplication: BookingSubmissionResult | null;
  onSubmit: BookingSubmitHandler;
  onResetSuccess: () => void;
  onFieldChange: BookingFieldChangeHandler;
};

export function BookingSection({
  content,
  contacts,
  formData,
  isSubmitting,
  submitError,
  submittedApplication,
  onSubmit,
  onResetSuccess,
  onFieldChange,
}: BookingSectionProps) {
  const phoneTextRef = useRef<HTMLParagraphElement | null>(null);
  const emailTextRef = useRef<HTMLParagraphElement | null>(null);

  const activateCopyTarget = (node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    document
      .querySelectorAll<HTMLElement>("[data-copy-active='true']")
      .forEach((element) => {
        element.dataset.copyActive = "false";
      });

    node.dataset.copyActive = "true";
  };

  return (
    <section id="booking" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div className="space-y-8">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
                  Запись
                </span>
                <h2 className="mb-4 text-3xl font-bold text-forest sm:text-4xl">
                  {content.bookingTitle}
                </h2>
                <p className="leading-relaxed text-forest/50">
                  {content.bookingDescription}
                </p>
              </div>

              <BookingContactInfo
                contacts={contacts}
                onActivateCopyTarget={activateCopyTarget}
                phoneTextRef={phoneTextRef}
                emailTextRef={emailTextRef}
              />
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="rounded-3xl border border-sage-light/20 bg-cream p-6 shadow-sm sm:p-10">
              {submittedApplication ? (
                <BookingSuccessState
                  submittedApplication={submittedApplication}
                  onResetSuccess={onResetSuccess}
                />
              ) : (
                <BookingForm
                  formData={formData}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  onFieldChange={onFieldChange}
                  onSubmit={onSubmit}
                />
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
