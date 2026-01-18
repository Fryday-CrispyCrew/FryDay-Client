// src/features/todo/queries/home/homeKeys.js
export const homeKeys = {
  all: ["home"],

  todos: () => [...homeKeys.all, "todos"],
  todosList: ({date, categoryId = null}) => [
    ...homeKeys.todos(),
    {date, categoryId},
  ],

  characterStatus: () => [...homeKeys.all, "characterStatus"],
  characterStatusByDate: (date) => [...homeKeys.characterStatus(), {date}],
};
