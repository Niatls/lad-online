import type { Message } from "@/components/chat/chat-widget/types";

type ChatWidgetMessageMetaProps = {
  isSystem: boolean;
  isVisitor: boolean;
  message: Message;
};

export function ChatWidgetMessageMeta({
  isSystem,
  isVisitor,
  message,
}: ChatWidgetMessageMetaProps) {
  return (
    <div
      className={`mt-1.5 text-[10px] font-medium ${
        isSystem
          ? "text-forest/35"
          : isVisitor
            ? "text-white/40"
            : "text-forest/30"
      }`}
    >
      {new Date(message.createdAt).toLocaleTimeString("ru", {
        hour: "2-digit",
        minute: "2-digit",
      })}
      {message.isEdited ? " · изменено" : ""}
    </div>
  );
}
