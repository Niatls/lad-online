import { useChatWidgetStopVoiceCapture } from "@/components/chat/chat-widget/use-chat-widget-stop-voice-capture";
import { useChatWidgetToggleVoiceRecording } from "@/components/chat/chat-widget/use-chat-widget-toggle-voice-recording";
import { useChatWidgetUploadVoiceMessage } from "@/components/chat/chat-widget/use-chat-widget-upload-voice-message";
import type { Message, VoiceDraft } from "@/components/chat/chat-widget/types";

type UseChatWidgetVoiceRecordingControlsParams = {
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

export function useChatWidgetVoiceRecordingControls({
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
}: UseChatWidgetVoiceRecordingControlsParams) {
  const stopVoiceCapture = useChatWidgetStopVoiceCapture({
    mediaRecorderRef,
    mediaStreamRef,
  });

  const uploadVoiceMessage = useChatWidgetUploadVoiceMessage({
    sessionId,
    replyTarget,
    lastMsgIdRef,
    setError,
    setMessages,
    setReplyTarget,
    setSendingVoice,
  });

  const handleToggleVoiceRecording = useChatWidgetToggleVoiceRecording({
    existingVoiceDraft: voiceDraft,
    needsName,
    sessionId,
    sendingVoice,
    isRecordingVoice,
    editingMessageId,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    voiceChunksRef,
    setError,
    setIsRecordingVoice,
    setRecordingStartedAt,
    setVoiceDraft,
    stopVoiceCapture,
  });

  const handleSendVoiceDraft = async () => {
    if (!voiceDraft || sendingVoice) {
      return;
    }

    await uploadVoiceMessage(voiceDraft.blob, voiceDraft.durationMs);
    setVoiceDraft(null);
  };

  const clearVoiceDraft = () => {
    setVoiceDraft(null);
    setError(null);
  };

  return {
    clearVoiceDraft,
    handleSendVoiceDraft,
    handleToggleVoiceRecording,
  };
}
