export function formatApplicationNumber(
  id: number,
  verificationCode?: string | null
) {
  const normalizedCode = verificationCode?.trim().toUpperCase();

  return normalizedCode ? `LAD-${normalizedCode}-K0${id}` : `LAD-K0${id}`;
}

export function parseApplicationNumber(value: string) {
  const trimmed = value.trim();
  const match =
    trimmed.match(/^LAD[-\s]*[A-Z0-9]+[-\s]*K0*(\d+)$/i) ||
    trimmed.match(/^LAD[-\s]*РєРѕРґ[-\s]*K0*(\d+)$/i) ||
    trimmed.match(/^LAD[-\s]*0*(\d+)$/i) ||
    trimmed.match(/^0*(\d+)$/);

  return match ? Number(match[1]) : Number.NaN;
}

export function parseApplicationCode(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^LAD[-\s]*([A-Z0-9]+)[-\s]*K0*(\d+)$/i);

  if (!match) {
    return {
      id: parseApplicationNumber(trimmed),
      verificationCode: null,
    };
  }

  return {
    id: Number(match[2]),
    verificationCode: match[1].toUpperCase(),
  };
}

export function generateApplicationVerificationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
