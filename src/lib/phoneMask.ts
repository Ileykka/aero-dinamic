export const PHONE_PREFIX_LENGTH = 5;
export const PHONE_MAX_DIGITS = 9;

export function formatPhoneFromDigits(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
  const slot = (index: number) => d[index] ?? "_";
  return `+375 ${slot(0)}${slot(1)} ${slot(2)}${slot(3)}${slot(4)}-${slot(5)}${slot(6)}-${slot(7)}${slot(8)}`;
}

export function getPhoneCaretIndex(digitCount: number): number {
  const template = formatPhoneFromDigits("");
  let seen = 0;
  for (let i = 0; i < template.length; i += 1) {
    if (template[i] === "_") {
      if (seen === digitCount) return i;
      seen += 1;
    }
  }
  return template.length;
}

export function extractPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("375")) return digits.slice(3, 3 + PHONE_MAX_DIGITS);
  return digits.slice(0, PHONE_MAX_DIGITS);
}
