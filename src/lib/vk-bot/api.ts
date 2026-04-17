import { VK_ACCESS_TOKEN, VK_API_VERSION } from "./config";

export async function callVkApi(
  method: string,
  params: Record<string, string | number>
) {
  if (!VK_ACCESS_TOKEN) {
    throw new Error("VK_COMMUNITY_TOKEN is not configured");
  }

  const searchParams = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
    access_token: VK_ACCESS_TOKEN,
    v: VK_API_VERSION,
  });

  const response = await fetch(`https://api.vk.com/method/${method}`, {
    method: "POST",
    body: searchParams,
  });

  const json = (await response.json()) as {
    error?: { error_code: number; error_msg: string };
    response?: unknown;
  };

  if (json.error) {
    throw new Error(
      `VK API error ${json.error.error_code}: ${json.error.error_msg}`
    );
  }

  return json.response;
}

export async function sendVkMessage(peerId: number, message: string) {
  await callVkApi("messages.send", {
    peer_id: peerId,
    message,
    random_id: Date.now(),
  });
}
