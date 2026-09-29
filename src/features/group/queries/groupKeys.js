export const groupKeys = {
  all: ["groups"],
  list: () => ["groups", "list"],
  detail: (id) => ["groups", String(id), "detail"],
  memberTodos: (groupId, userId) => ["groups", String(groupId), "memberTodos", String(userId)],
  notification: (id) => ["groups", String(id), "notification"],
  categories: (id) => ["groups", String(id), "categories"],
};

