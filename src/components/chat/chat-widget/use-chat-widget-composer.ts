import { useChatWidgetComposerHandleSend } from "@/components/chat/chat-widget/use-chat-widget-composer-handle-send";
import { useChatWidgetComposerToggleVoiceRecording } from "@/components/chat/chat-widget/use-chat-widget-composer-toggle-voice-recording";
import type { Message, VoiceDraft } from "@/components/chat/chat-widget/types";

type UseChatWidgetComposerParams = {
  voiceDraft: VoiceDraft | null;
  needsName: boolean;
  sessionId: number | null;
  input: string;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  editingMessageId: number | null;
  replyTarget: Message | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSendingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  setVoiceDraft: React.Dispatch<React.SetStateAction<VoiceDraft | null>>;
  lastMsgIdRef: React.MutableRefObject<number>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function useChatWidgetComposer({
  voiceDraft,
  needsName,
  sessionId,
  input,
  sending,
  sendingVoice,
  isRecordingVoice,
  editingMessageId,
  replyTarget,
  setInput,
  setSending,
  setMessages,
  setReplyTarget,
  setEditingMessageId,
  setError,
  setSendingVoice,
  setIsRecordingVoice,
  setRecordingStartedAt,
  setVoiceDraft,
  lastMsgIdRef,
  mediaRecorderRef,
  mediaStreamRef,
  recordingStartedAtRef,
  voiceChunksRef,
}: UseChatWidgetComposerParams) {
  const {
    clearVoiceDraft,
    handleSendVoiceDraft,
    handleToggleVoiceRecording,
  } = useChatWidgetComposerToggleVoiceRecording({
    voiceDraft,
    needsName,
    sessionId,
    sendingVoice,
    isRecordingVoice,
    editingMessageId,
    replyTarget,
    setMessages,
    setReplyTarget,
    setError,
    setSendingVoice,
    setIsRecordingVoice,
    setRecordingStartedAt,
    setVoiceDraft,
    lastMsgIdRef,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    voiceChunksRef,
  });

  const handleSend = useChatWidgetComposerHandleSend({
    sessionId,
    input,
    sending,
    editingMessageId,
    replyTarget,
    lastMsgIdRef,
    setEditingMessageId,
    setError,
    setInput,
    setMessages,
    setReplyTarget,
    setSending,
  });

  return {
    clearVoiceDraft,
    handleSend,
    handleSendVoiceDraft,
    handleToggleVoiceRecording,
  };
}
