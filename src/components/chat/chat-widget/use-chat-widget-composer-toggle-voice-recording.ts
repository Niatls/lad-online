import { useChatWidgetVoiceRecordingControls } from "@/components/chat/chat-widget/use-chat-widget-voice-recording-controls";
import type { Message, VoiceDraft } from "@/components/chat/chat-widget/types";

type UseChatWidgetComposerToggleVoiceRecordingParams = {
  voiceDraft: VoiceDraft | null;
  needsName: boolean;
  sessionId: number | null;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  editingMessageId: number | null;
  replyTarget: Message | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
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

export function useChatWidgetComposerToggleVoiceRecording({
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
}: UseChatWidgetComposerToggleVoiceRecordingParams) {
  return useChatWidgetVoiceRecordingControls({
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
}
