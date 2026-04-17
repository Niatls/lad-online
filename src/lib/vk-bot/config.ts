export const VK_ACCESS_TOKEN = process.env.VK_COMMUNITY_TOKEN?.trim();
export const VK_API_VERSION = process.env.VK_API_VERSION?.trim() || "5.199";
export const VK_CONFIRMATION_TOKEN = process.env.VK_CONFIRMATION_TOKEN?.trim();
export const VK_SECRET_KEY = process.env.VK_SECRET_KEY?.trim();

export function isVkBotConfigured() {
  return Boolean(VK_ACCESS_TOKEN && VK_CONFIRMATION_TOKEN);
}

export function isValidVkSecret(secret: string | undefined) {
  if (!VK_SECRET_KEY) {
    return true;
  }

  return secret === VK_SECRET_KEY;
}

export function getVkConfirmationToken() {
  return VK_CONFIRMATION_TOKEN;
}
