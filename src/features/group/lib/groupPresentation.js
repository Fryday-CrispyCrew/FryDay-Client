export const interactionPresentation = {
  KNOCK: { reactionType: "bell", message: "님, 손님 왔어요!" },
  ORDER: { reactionType: "order", message: "님, 주문이요!" },
  DELICIOUS: { reactionType: "more", message: "님, 추가 주문할게요!" },
  APPLAUSE: { reactionType: "deil", message: "님, 별점 5점 드릴게요!" },
};
export const groupStatusLabels = {
  BEFORE_OPEN: "영업 전",
  PREPARING: "영업 준비",
  FRYING: "튀김 조리 중",
  CLOSED: "영업 종료",
};
export function toGroupMember(member) {
  return {
    id: member.userId,
    name: member.nickname ?? "이름 없는 가게",
    current: member.completedCount,
    max: member.totalCount,
    status: member.status,
    interaction: member.availableInteraction,
    reactionType: interactionPresentation[member.availableInteraction]?.reactionType,
  };
}
