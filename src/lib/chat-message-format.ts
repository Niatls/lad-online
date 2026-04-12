const VOICE_TOKEN_PREFIX = "[[VOICE_CALL_TOKEN:";
const VOICE_TOKEN_SUFFIX = "]]";
const VOICE_MESSAGE_PREFIX = "[[VOICE_MESSAGE:";
const VOICE_MESSAGE_SUFFIX = "]]";

export type VoiceMessagePayload = {
  url: string;
  mimeType?: string | null;
  durationMs?: number | null;
  fileSize?: number | null;
};

export function buildVoiceInviteMessage(token: string) {
  return `${VOICE_TOKEN_PREFIX}${token}${VOICE_TOKEN_SUFFIX}`;
}

export function parseVoiceInviteToken(content: string) {
  if (!content.startsWith(VOICE_TOKEN_PREFIX) || !content.endsWith(VOICE_TOKEN_SUFFIX)) {
    return null;
  }

  const token = content.slice(VOICE_TOKEN_PREFIX.length, -VOICE_TOKEN_SUFFIX.length).trim();
  return token || null;
}

export function buildVoiceMessageContent(payload: VoiceMessagePayload) {
  return `${VOICE_MESSAGE_PREFIX}${JSON.stringify(payload)}${VOICE_MESSAGE_SUFFIX}`;
}

export function parseVoiceMessageContent(content: string): VoiceMessagePayload | null {
  if (!content.startsWith(VOICE_MESSAGE_PREFIX) || !content.endsWith(VOICE_MESSAGE_SUFFIX)) {
    return null;
  }

  try {
    const raw = content.slice(VOICE_MESSAGE_PREFIX.length, -VOICE_MESSAGE_SUFFIX.length).trim();
    const parsed = JSON.parse(raw) as VoiceMessagePayload;
    if (!parsed || typeof parsed !== "object" || typeof parsed.url !== "string" || !parsed.url.trim()) {
      return null;
    }

    return {
      url: parsed.url,
      mimeType: typeof parsed.mimeType === "string" ? parsed.mimeType : null,
      durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : null,
      fileSize: typeof parsed.fileSize === "number" ? parsed.fileSize : null,
    };
  } catch {
    return null;
  }
}

export function getChatMessagePreviewText(content: string) {
  if (parseVoiceInviteToken(content)) {
    return null;
  }

  if (parseVoiceMessageContent(content)) {
    return "Голосовое сообщение";
  }

  return content;
}
