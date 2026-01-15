// src/features/todo/queries/home/homeApi.js
import api from "../../../../shared/lib/api";
// ✅ 위 경로는 예시야. 실제 api.js 위치에 맞게 수정해줘.

export const homeApi = {
  // GET /api/todos?date={date}&categoryId={categoryId}
  getTodos: async ({date, categoryId}) => {
    const res = await api.get("/api/todos", {
      params: {
        date, // required
        ...(categoryId ? {categoryId} : {}),
      },
    });
    return res.data; // { success, message, data: [...], timestamp }
  },

  // GET /api/todos/character-status (명세는 query 없지만 예시는 ?date= 로 호출됨)
  getCharacterStatus: async ({date} = {}) => {
    const res = await api.get("/api/todos/character-status", {
      params: date ? {date} : {},
    });
    return res.data; // { success, message, data: {...}, timestamp }
  },

  // POST /api/todos/{todoId}/completion
  toggleCompletion: async ({todoId}) => {
    const res = await api.post(`/api/todos/${todoId}/completion`);
    return res.data;
  },

  // DELETE /api/todos/{todoId}
  deleteTodo: async ({todoId}) => {
    const res = await api.delete(`/api/todos/${todoId}`);
    return res.data;
  },

  // DELETE /api/todos/recurrence/{recurrenceId}
  deleteRecurrenceTodos: async ({recurrenceId}) => {
    const res = await api.delete(`/api/todos/recurrence/${recurrenceId}`);
    return res.data;
  },

  // PATCH /api/todos/{todoId}/tomorrow
  moveTomorrow: async ({todoId}) => {
    const res = await api.patch(`/api/todos/${todoId}/tomorrow`);
    return res.data;
  },

  // PATCH /api/todos/{todoId}/today
  moveToday: async ({todoId}) => {
    const res = await api.patch(`/api/todos/${todoId}/today`);
    return res.data;
  },

  // PATCH /api/todos/reorder?date={date}  body: { ids: [...] }
  reorderTodos: async ({date, ids}) => {
    const res = await api.patch("/api/todos/reorder", {ids}, {params: {date}});
    return res.data;
  },
};
