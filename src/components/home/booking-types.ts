import type React from "react";

export type BookingFormData = {
  name: string;
  gender: string;
  age: string;
  email: string;
  phone: string;
  preferredTime: string;
  reason: string;
  contactMethod: string;
};

export type BookingSubmissionResult = {
  applicationNumber: string;
  contactHref: string;
  contactMethod: string;
  preferredTime: string;
};

export type BookingFieldChangeHandler = (
  field: keyof BookingFormData,
  value: string,
) => void;

export type BookingSubmitHandler = (event: React.FormEvent) => Promise<void>;
