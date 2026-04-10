const VOICE_TOKEN_PREFIX = "[[VOICE_CALL_TOKEN:";
const VOICE_TOKEN_SUFFIX = "]]";

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
