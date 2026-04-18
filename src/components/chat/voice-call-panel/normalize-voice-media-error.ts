export function normalizeVoiceMediaError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Не удалось получить доступ к микрофону.";
  }

  const mediaError = error as Error & { name?: string };
  const name = mediaError.name ?? "";
  const message = mediaError.message || "";
  const lowerMessage = message.toLowerCase();

  if (name === "NotAllowedError" || lowerMessage.includes("permission")) {
    return "Нет доступа к микрофону. Разрешите микрофон для сайта в браузере.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Микрофон не найден на устройстве.";
  }

  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    lowerMessage.includes("could not start audio source")
  ) {
    return "Не удалось запустить микрофон. Закройте приложения, которые могут использовать микрофон, и повторите.";
  }

  if (name === "AbortError") {
    return "Не удалось инициализировать микрофон. Попробуйте ещё раз.";
  }

  return message || "Не удалось получить доступ к микрофону.";
}
