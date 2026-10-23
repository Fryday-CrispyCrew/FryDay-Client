// 초대 링크는 app.fryday.co.kr 에 있는 랜딩으로 보낸다.
// 앱이 설치돼 있으면 OS 가 App Links / Universal Links 로 앱을 바로 열고, 없으면 랜딩이 스토어로 안내한다.
const INVITE_LINK_BASE = "https://app.fryday.co.kr/invite/";
const INVITE_LINK_PATTERN = /^https:\/\/app\.fryday\.co\.kr\/invite\/?(\?|#|$)/i;
// 랜딩의 "앱에서 바로 열기" 버튼이 쓰는 스킴. 인앱 브라우저처럼 OS 가 링크를 못 가로챌 때 쓴다.
const APP_SCHEME_PATTERN = /^fryday:\/\/group\/join\/?(\?|#|$)/i;

export const GROUP_CODE_LENGTH = 6;

function toCodeCharacters(text) {
  return (text ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/** 입력 중인 값을 코드 규칙(영숫자, 대문자, 6자리)에 맞춘다. 6자리를 넘으면 자른다. */
export function normalizeGroupCode(text) {
  return toCodeCharacters(text).slice(0, GROUP_CODE_LENGTH);
}

export function buildInviteLink(code) {
  return `${INVITE_LINK_BASE}?code=${encodeURIComponent(code)}`;
}

export function buildInviteMessage(code) {
  return `우리 같이 할 일 같이 튀겨볼래?\n그룹 코드 : ${code}\n${buildInviteLink(code)}`;
}

/** 초대 링크가 아니거나 코드가 정확히 6자리가 아니면 null. 링크의 코드는 자르지 않고 거부한다. */
export function parseInviteCode(url) {
  if (typeof url !== "string") return null;
  if (!INVITE_LINK_PATTERN.test(url) && !APP_SCHEME_PATTERN.test(url)) return null;

  const match = url.match(/[?&]code=([^&#]*)/);
  if (!match) return null;

  let raw;
  try {
    raw = decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  const code = toCodeCharacters(raw);
  return code.length === GROUP_CODE_LENGTH ? code : null;
}
