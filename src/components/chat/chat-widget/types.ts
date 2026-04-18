export type Message = {
  id: number;
  sender: string;
  content: string;
  replyToId: number | null;
  deletedAt: string | null;
  deletedBy: string | null;
  editedAt: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: {
    id: number;
    sender: string;
    content: string;
    isDeleted: boolean;
  } | null;
  createdAt: string;
};

export type VoiceInvite = {
  token: string;
  status: string;
  expiresAt: string;
};

export type VoiceDraft = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
};
