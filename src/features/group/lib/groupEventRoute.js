// groupId가 있어도 가입·생성 과정에서는 아직 그룹 조회 권한이 없을 수 있다.
const MEMBER_ROUTES = new Set([
  "GroupDetail",
  "GroupMemberTodos",
  "GroupSetting",
  "GroupNameEdit",
]);

export function getGroupEventId(route) {
  const isCategorySetting = route?.name === "GroupCategorySelect"
    && (route.params?.mode ?? "setting") === "setting";
  if (!MEMBER_ROUTES.has(route?.name) && !isCategorySetting) return null;
  const id = route?.params?.groupId;
  return id ? String(id) : null;
}
