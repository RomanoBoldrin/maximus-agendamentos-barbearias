/**
 * Phone formatting helpers for appointment booking
 */

/**
 * Format a phone number input string with Brazilian phone mask (XX) XXXXX-XXXX
 * @param {string} value - Raw phone input value
 * @returns {string} Formatted phone string with mask
 */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits.length ? `(${digits}` : "";

  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Extract only the digits from a phone number string
 * @param {string} value - Phone number with any formatting
 * @returns {string} Digits only
 */
export function getPhoneDigits(value) {
  return value.replace(/\D/g, "");
}
