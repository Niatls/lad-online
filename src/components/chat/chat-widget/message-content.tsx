import { resolveChatWidgetMessageState } from "@/components/chat/chat-widget/resolve-chat-widget-message-state";
import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";

type ChatWidgetMessageContentProps = {
  isSystem: boolean;
  isVisitor: boolean;
  message: Message;
};

export function ChatWidgetMessageContent({
  isSystem,
  isVisitor,
  message,
}: ChatWidgetMessageContentProps) {
  const { voiceMessage } = resolveChatWidgetMessageState(message);

  if (message.isDeleted) {
    return <p className="italic opacity-70">Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р вЂ™Р’В Р В Р’В Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р В Р вЂ№Р В Р вЂ Р В РІР‚С™Р РЋРЎвЂєР В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р В Р вЂ№Р В Р вЂ Р В РІР‚С™Р РЋРЎвЂєР В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р Р†Р вЂљРІвЂћСћР В РІР‚в„ўР вЂ™Р’В±Р В Р’В Р вЂ™Р’В Р В Р’В Р В РІР‚в„–Р В Р’В Р В РІР‚В Р В Р’В Р Р†Р вЂљРЎв„ўР В РІР‚в„ўР вЂ™Р’В°Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р Р†Р вЂљРІвЂћСћР В РІР‚в„ўР вЂ™Р’ВµР В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р вЂ™Р’В Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В Р В Р’В Р В Р вЂ№Р В РЎвЂ“Р Ռ†ՌвЂљՌЎв„ўՌ вЂ™Ռ’ВՌ Վ Ռ’В Ռ вЂ™Ռ’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Ռ’В Ռ Վ Ռ’В Ռ Ռ†ՌвЂљՌІвЂћՍћՌ Վ ՌІՌ‚в„ўՌ вЂ™Ռ’Вµ Ռ Վ ԽЊՌ‹ԽЊՌЋՌІՌ‚ՍљԽЊՎ ԽЋՎ ԽЊՍћՌІՌ‚ՎԽЊՎ ԽЋՎ ԽЊвЂ™Ռ’В°ԽЊՎ ԽЋՎ ԽЊвЂ™Ռ’В»ԽЊՎ ԽЋՎ ԽЊвЂ™Ռ’ВµԽЊՎ ԽЋՎ ԽЊՎ ՌІՌ‚Վ¦ԽЊՎ ԽЋՎ ԽЊՌЋՌІՌ‚Սћ</p>;
  }

  if (voiceMessage) {
    return <VoiceMessagePlayer payload={voiceMessage} tone={isSystem ? "system" : isVisitor ? "visitor" : "admin"} />;
  }

  return <p>{message.content}</p>;
}
