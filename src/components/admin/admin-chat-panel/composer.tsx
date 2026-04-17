import type { Message, Session } from "@/components/admin/admin-chat-panel/types";

import { ComposerEditingBanner } from "./composer-editing-banner";
import { ComposerInputRow } from "./composer-input-row";
import { ComposerRecordingStatus } from "./composer-recording-status";
import { ComposerReplyPreview } from "./composer-reply-preview";
import { ComposerSelectionToolbar } from "./composer-selection-toolbar";
import { ComposerVoiceInvite } from "./composer-voice-invite";

type AdminChatComposerProps = {
  selectedMessageIds: number[];
  deletingMessages: boolean;
  creatingVoiceToken: boolean;
  replyTarget: Message | null;
  editingMessageId: number | null;
  input: string;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  selectedSession: Session | null;
  getMessagePreview: (message: Message) => string;
  formatTime: (date: string) => string;
  onClearSelection: () => void;
  onDeleteMessages: () => void;
  onGenerateVoiceToken: () => void;
  onClearReply: () => void;
  onCancelEditing: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
};

export function AdminChatComposer({
  selectedMessageIds,
  deletingMessages,
  creatingVoiceToken,
  replyTarget,
  editingMessageId,
  input,
  sending,
  sendingVoice,
  isRecordingVoice,
  recordingStartedAt,
  selectedSession,
  getMessagePreview,
  formatTime,
  onClearSelection,
  onDeleteMessages,
  onGenerateVoiceToken,
  onClearReply,
  onCancelEditing,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
}: AdminChatComposerProps) {
  return (
    <div className="shrink-0 border-t border-sage-light/10 bg-white/60 p-6 backdrop-blur-md">
      <ComposerSelectionToolbar
        deletingMessages={deletingMessages}
        selectedCount={selectedMessageIds.length}
        onClearSelection={onClearSelection}
        onDeleteMessages={onDeleteMessages}
      />

      <ComposerVoiceInvite
        creatingVoiceToken={creatingVoiceToken}
        onGenerateVoiceToken={onGenerateVoiceToken}
      />

      <ComposerReplyPreview
        getMessagePreview={getMessagePreview}
        replyTarget={replyTarget}
        selectedSession={selectedSession}
        onClearReply={onClearReply}
      />

      <ComposerEditingBanner
        editingMessageId={editingMessageId}
        onCancelEditing={onCancelEditing}
      />

      <ComposerInputRow
        editingMessageId={editingMessageId}
        input={input}
        isRecordingVoice={isRecordingVoice}
        sending={sending}
        sendingVoice={sendingVoice}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onSend={onSend}
        onToggleVoiceRecording={onToggleVoiceRecording}
      />

      <ComposerRecordingStatus
        isRecordingVoice={isRecordingVoice}
        recordingStartedAt={recordingStartedAt}
        formatTime={formatTime}
      />
    </div>
  );
}
