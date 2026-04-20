export async function createAdminVoiceToken(sessionId: number): Promise<{ token?: string }> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}/voice-token`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create voice token");
  }

  return res.json();
}

export async function deleteAdminChatSession(
  sessionId: number,
  mode: "hard" | "soft"
): Promise<void> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) {
    throw new Error(mode === "soft" ? "Failed to archive session" : "Failed to delete session");
  }
}

type DownloadVoiceFile = {
  url: string;
  filename: string;
};

type DialogDownloadPayload = {
  filename: string;
  textFilename: string;
  text: string;
  voiceFiles: DownloadVoiceFile[];
};

const encoder = new TextEncoder();
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function getCrc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

function createZipBlob(files: { filename: string; data: Uint8Array }[]) {
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.filename);
    const crc = getCrc32(file.data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);

    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, file.data.length);
    writeUint32(localView, 22, file.data.length);
    writeUint16(localView, 26, name.length);
    writeUint16(localView, 28, 0);
    localHeader.set(name, 30);

    chunks.push(localHeader, file.data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, file.data.length);
    writeUint32(centralView, 24, file.data.length);
    writeUint16(centralView, 28, name.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(name, 46);
    centralDirectory.push(centralHeader);

    offset += localHeader.length + file.data.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralDirectory.reduce((sum, chunk) => sum + chunk.length, 0);
  const endHeader = new Uint8Array(22);
  const endView = new DataView(endHeader.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, centralDirectoryOffset);
  writeUint16(endView, 20, 0);

  return new Blob([...chunks, ...centralDirectory, endHeader], {
    type: "application/zip",
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadAdminChatSession(sessionId: number): Promise<void> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}/download?format=json`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to download session");
  }

  const payload = (await res.json()) as DialogDownloadPayload;
  const archiveFiles = [
    {
      filename: payload.textFilename,
      data: encoder.encode(payload.text),
    },
  ];

  for (const voiceFile of payload.voiceFiles) {
    const voiceRes = await fetch(voiceFile.url, { cache: "no-store" });
    if (!voiceRes.ok) {
      throw new Error("Failed to download voice message");
    }

    archiveFiles.push({
      filename: voiceFile.filename,
      data: new Uint8Array(await voiceRes.arrayBuffer()),
    });
  }

  if (archiveFiles.length === 1) {
    downloadBlob(new Blob([payload.text], { type: "text/plain;charset=utf-8" }), payload.textFilename);
    return;
  }

  downloadBlob(createZipBlob(archiveFiles), payload.filename);
}

export async function deleteAdminChatMessages(
  sessionId: number,
  messageIds: number[]
): Promise<number[]> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete messages");
  }

  const data = await res.json();
  return data.deletedIds ?? [];
}
