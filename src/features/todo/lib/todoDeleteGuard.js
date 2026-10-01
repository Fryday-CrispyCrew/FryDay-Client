// 렌더링 전에 들어오는 연타도 차단한다. 성공한 ID는 오래된 UI가 남아도 재삭제하지 않는다.
export function createTodoDeleteGuard() {
  const blocked = new Set();
  return {
    isBlocked: (id) => blocked.has(String(id)),
    async run(id, request) {
      const key = String(id);
      if (blocked.has(key)) return false;
      blocked.add(key);
      try {
        await request();
        return true;
      } catch (error) {
        blocked.delete(key);
        throw error;
      }
    },
  };
}
