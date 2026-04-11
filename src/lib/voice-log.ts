import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

type VoiceLogEntry = {
  token: string;
  sessionId?: number | null;
  role?: "admin" | "visitor" | "system";
  eventType: string;
  message: string;
  details?: unknown;
};

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "voice-events.jsonl");

export async function appendVoiceLog(entry: VoiceLogEntry) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(payload)}\n`, "utf8");
}

