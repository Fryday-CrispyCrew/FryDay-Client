// src/features/todo/queries/sheet/sheetKeys.js
export const sheetKeys = {
  all: ["todoSheet"],

  todos: () => [...sheetKeys.all, "todos"],
  todoDetail: (todoId) => [...sheetKeys.todos(), "detail", todoId],

  recurrence: () => [...sheetKeys.all, "recurrence"],
  recurrenceDetail: (recurrenceId) => [
    ...sheetKeys.recurrence(),
    "detail",
    recurrenceId,
  ],
};
