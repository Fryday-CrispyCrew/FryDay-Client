import { groupApi } from "../api/groupApi";

export async function assertCategoryCanBeDeleted(categoryId) {
  // 캐시 대신 현재 서버 설정을 확인한다. 여러 그룹 중 하나라도 마지막 공개
  // 카테고리로 사용하고 있다면 삭제할 수 없다. 조회 실패 시에도 삭제하지 않는다.
  const { groups } = await groupApi.getGroups();
  const settings = await Promise.all(
    groups.map((group) => groupApi.getPublicCategories(group.groupId)),
  );
  const isLastPublicCategory = settings.some(({ categories }) => {
    const publicCategories = categories.filter((category) => category.isPublic);
    return publicCategories.length === 1 &&
      String(publicCategories[0].categoryId) === String(categoryId);
  });
  if (isLastPublicCategory) {
    const error = new Error("마지막 공개 카테고리는 삭제할 수 없어요");
    error.code = "LAST_GROUP_PUBLIC_CATEGORY";
    throw error;
  }
}
