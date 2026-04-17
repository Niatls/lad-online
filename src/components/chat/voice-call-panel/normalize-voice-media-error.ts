export function normalizeVoiceMediaError(error: unknown) {
  if (!(error instanceof Error)) {
    return "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РґРѕСЃС‚СѓРї Рє РјРёРєСЂРѕС„РѕРЅСѓ.";
  }

  const mediaError = error as Error & { name?: string };
  const name = mediaError.name ?? "";
  const message = mediaError.message || "";
  const lowerMessage = message.toLowerCase();

  if (name === "NotAllowedError" || lowerMessage.includes("permission")) {
    return "РќРµС‚ РґРѕСЃС‚СѓРїР° Рє РјРёРєСЂРѕС„РѕРЅСѓ. Р Р°Р·СЂРµС€РёС‚Рµ РјРёРєСЂРѕС„РѕРЅ РґР»СЏ СЃР°Р№С‚Р° РІ Р±СЂР°СѓР·РµСЂРµ.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "РњРёРєСЂРѕС„РѕРЅ РЅРµ РЅР°Р№РґРµРЅ РЅР° СѓСЃС‚СЂРѕР№СЃС‚РІРµ.";
  }

  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    lowerMessage.includes("could not start audio source")
  ) {
    return "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РїСѓСЃС‚РёС‚СЊ РјРёРєСЂРѕС„РѕРЅ. Р—Р°РєСЂРѕР№С‚Рµ РїСЂРёР»РѕР¶РµРЅРёСЏ, РєРѕС‚РѕСЂС‹Рµ РјРѕРіСѓС‚ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РјРёРєСЂРѕС„РѕРЅ, Рё РїРѕРІС‚РѕСЂРёС‚Рµ.";
  }

  if (name === "AbortError") {
    return "РќРµ СѓРґР°Р»РѕСЃСЊ РёРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°С‚СЊ РјРёРєСЂРѕС„РѕРЅ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.";
  }

  return message || "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РґРѕСЃС‚СѓРї Рє РјРёРєСЂРѕС„РѕРЅСѓ.";
}
