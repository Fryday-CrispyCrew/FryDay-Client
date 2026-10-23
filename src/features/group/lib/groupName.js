export function sanitizeGroupName(value = "") {
  return value
    .replace(/[0-9#*]\uFE0F?\u20E3/gu, "")
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\u200B-\u200D\uFE0E\uFE0F\u{E0020}-\u{E007F}]/gu, "");
}

export function getGroupNameError(value) {
  if (value.length > 0 && !value.trim()) return "whitespace";
  if ([...value].length > 10) return "tooLong";
  if (sanitizeGroupName(value) !== value) return "invalid";
  return null;
}
export function isValidGroupName(value) {
  return value.replace(/\s/g, "").length > 0 && !getGroupNameError(value);
}
