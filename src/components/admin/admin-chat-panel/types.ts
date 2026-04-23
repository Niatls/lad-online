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

export type Session = {
  id: number;
  visitorId: string;
  visitorName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  _count: { messages: number };
};

export type UsageSummary = {
  totalBytes: number;
  inviteCount: number;
  monthlyCapBytes: number;
};

export type VoiceInvite = {
  token: string;
  status: string;
  expiresAt: string;
  metadata?: unknown;
};

export type VoiceEvent = {
  id: number;
  inviteId: number;
  sessionId: number;
  token: string;
  role: string;
  eventType: string;
  message: string;
  details: unknown;
  createdAt: string;
};

export type VoiceLiveStats = {
  durationSeconds: number;
  usageBytes: number;
  liveServerBytes: number;
  trafficRouteLabel: string;
  iceRoute: string;
  connected: boolean;
};
