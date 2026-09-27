export function getGroupNameError(value) {
  const compact = value.replace(/\s/g, "");
  if (value.length > 0 && compact.length === 0) return "whitespace";
  if ([...compact].length > 10) return "tooLong";
  if (/[\p{Extended_Pictographic}\p{Regional_Indicator}\u20e3]/u.test(value)) return "invalid";
  return null;
}
export function isValidGroupName(value) {
  return value.replace(/\s/g, "").length > 0 && !getGroupNameError(value);
}
