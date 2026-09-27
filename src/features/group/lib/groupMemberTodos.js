export function toPublicTodoSections(categories = []) {
  // 카테고리는 서버가 해당 그룹원의 노출 순서대로 내려준다.
  return categories.map((category) => ({
    categoryId: category.categoryId,
    label: category.name,
    color: category.colorHex,
    todos: [...(category.todos ?? [])]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((todo) => ({
        id: todo.todoId,
        title: todo.description,
        done: todo.status === "COMPLETED",
      })),
  }));
}

export function getPublicTodoStatus(sections) {
  const todos = sections.flatMap((section) => section.todos);
  if (todos.length === 0) return "BEFORE_OPEN";
  const completed = todos.filter((todo) => todo.done).length;
  if (completed === 0) return "PREPARING";
  return completed === todos.length ? "CLOSED" : "FRYING";
}
