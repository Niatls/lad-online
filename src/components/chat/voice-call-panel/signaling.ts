export async function postVoiceSignal(
  token: string,
  role: "admin" | "visitor",
  signalType: string,
  payload: unknown,
) {
  await fetch(`/api/chat/voice/${token}/signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, signalType, payload }),
  });
}

export async function postVoiceEventLog(
  token: string,
  role: "admin" | "visitor",
  eventType: string,
  message: string,
  details?: unknown,
) {
  try {
    await fetch(`/api/chat/voice/${token}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, eventType, message, details }),
    });
  } catch {
    // best effort logging only
  }
}

type EndVoiceInviteParams = {
  token: string;
  role: "admin" | "visitor";
  usageBytes: number;
  durationSeconds: number;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
};

export async function endVoiceInvite({
  token,
  role,
  usageBytes,
  durationSeconds,
  postSignal,
}: EndVoiceInviteParams) {
  await Promise.allSettled([
    postSignal("hangup", null),
    fetch(`/api/chat/voice/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "end",
        role,
        dataUsageBytes: usageBytes,
        durationSeconds,
      }),
    }),
  ]);
}
