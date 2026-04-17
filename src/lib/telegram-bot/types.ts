export type TelegramSessionState =
  | "idle"
  | "ask_question_name"
  | "ask_question_contact"
  | "ask_question_body"
  | "booking_name"
  | "booking_gender"
  | "booking_age"
  | "booking_date"
  | "booking_time"
  | "booking_contact_method"
  | "booking_phone"
  | "booking_email"
  | "booking_reason";

export type TelegramBookingDraft = {
  age: string;
  contactMethod: string;
  email: string;
  gender: string;
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
};
