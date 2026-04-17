import type { db } from "@/lib/db";

export type VkSessionState =
  | "idle"
  | "ask_question_name"
  | "ask_question_contact"
  | "ask_question_body"
  | "booking_name"
  | "booking_contact"
  | "booking_time";

export type VkMessageEvent = {
  object?: {
    message?: {
      from_id?: number;
      peer_id?: number;
      text?: string;
    };
  };
  secret?: string;
  type?: string;
};

export type VkSessionRecord = Awaited<
  ReturnType<typeof db.vkConversationSession.upsert>
>;
