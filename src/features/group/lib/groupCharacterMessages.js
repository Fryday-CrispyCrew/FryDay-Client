const GROUP_MESSAGES = {
  CASE_A: [
    "어서 와! 아직 준비 중이야",
    "조금만 기다려줘, 주인장 좀 불러줄래?",
    "놀러 와줘서 고마워! 튀김은 준비 중이야!",
  ],
  CASE_B: [
    "주인장은 뭐 하고 있지?",
    "구경 온 거야? 주인장 좀 재촉해줘!",
    "이제 곧 시작할 거야!",
  ],
  CASE_C: [
    "조금씩 완성하고 있어!",
    "같이 응원해줄 거지?",
    "바삭해지는 중이야!",
  ],
  CASE_D: [
    "거의 다 튀겼어!",
    "거의 다 와 간다!",
    "바삭하게 잘 튀기지?",
  ],
  CASE_E: [
    "늦은 밤이야, 주인장은 뭐 하는 중이지?",
    "어두워졌는데 튀김이 남았어… 재촉해줘!",
    "다 튀길 수 있도록 응원해줘!",
  ],
  CASE_G: [
    "주인장한테 별 5점을 남겨줘!",
    "오늘 할 일 끝!",
    "다 튀겼다! 대단하지?",
  ],
};

export function pickGroupCharacterMessage(status, previous) {
  // 서버의 밤 시간대 두 상태는 그룹 전용 CaseE 문구를 공유한다.
  const key = status === "CASE_E1" || status === "CASE_E2" ? "CASE_E" : status;
  const pool = GROUP_MESSAGES[key] ?? [];
  const candidates = pool.filter((message) => message !== previous);
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : "";
}
