// src/features/todo/queries/category/categoryKeys.js
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: () => [...categoryKeys.lists()],
};
