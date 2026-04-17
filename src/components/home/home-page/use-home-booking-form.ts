"use client";

import type React from "react";
import { useState } from "react";

import type {
  BookingFormData,
  BookingSubmissionResult,
} from "@/components/home/booking-section";

import { initialFormData } from "./constants";

export function useHomeBookingForm(previewMode: boolean) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApplication, setSubmittedApplication] =
    useState<BookingSubmissionResult | null>(null);

  const handleFieldChange = (field: keyof BookingFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (previewMode) {
      setSubmittedApplication({
        applicationNumber: "PREVIEW-001",
        contactHref: "#chat",
        contactMethod: "Чат сайта",
        preferredTime: formData.preferredTime || "выбранная дата",
      });
      setSubmitError("");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку");
      }

      setSubmittedApplication({
        applicationNumber: result.applicationNumber,
        contactHref: result.contactHref,
        contactMethod: result.contactMethod,
        preferredTime: result.preferredTime,
      });
      setFormData(initialFormData);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте еще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    setSubmittedApplication,
    submitError,
    submittedApplication,
  };
}
