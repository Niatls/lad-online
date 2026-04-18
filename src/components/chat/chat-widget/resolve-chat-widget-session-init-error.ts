const CHAT_CONNECT_ERROR = "Не удалось подключить чат. Попробуйте ещё раз.";
const CHAT_NETWORK_ERROR =
  "Не удалось загрузить чат. Проверьте соединение и попробуйте ещё раз.";

export function resolveChatWidgetSessionInitError(err: unknown) {
  return err instanceof Error && err.message === "Failed to create session"
    ? CHAT_CONNECT_ERROR
    : CHAT_NETWORK_ERROR;
}
