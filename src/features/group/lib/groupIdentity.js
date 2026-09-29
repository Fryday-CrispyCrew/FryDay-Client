// 서버 액세스 토큰의 sub가 사용자 ID다. UI의 본인 구분에만 사용하며 권한은 서버가 검증한다.
export function getUserIdFromAccessToken(token) {
  if (!token) return null;
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const { sub } = JSON.parse(atob(padded));
    return typeof sub === "string" && /^\d+$/.test(sub) ? sub : null;
  } catch {
    return null;
  }
}

export function splitGroupMembers(members = [], currentUserId) {
  const isSelf = (member) => currentUserId != null && String(member.userId) === String(currentUserId);
  return {
    self: members.find(isSelf) ?? null,
    others: members.filter((member) => !isSelf(member)),
  };
}
