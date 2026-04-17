import type { BookingFormData } from "@/components/home/booking-section";

export const initialFormData: BookingFormData = {
  name: "",
  gender: "",
  age: "",
  email: "",
  phone: "",
  preferredTime: "",
  reason: "",
  contactMethod: "",
};

export type CopyContextMenuState = {
  text: string;
  x: number;
  y: number;
} | null;
