import api from "../../../../shared/lib/api";

export const homeApi = {
  // GET /api/todos?date={date}&categoryId={categoryId}
  getTodos: async ({date, categoryId}) => {
    const res = await api.get("/api/todos", {
      params: {
        date, // required
        ...(categoryId ? {categoryId} : {}),
      },
    });
    return res.data;
  },

  // GET /api/todos/character-status
  getCharacterStatus: async ({date} = {}) => {
    const res = await api.get("/api/todos/character-status", {
      params: date ? {date} : {},
    });
    return res.data;
  },

  // POST /api/todos/{todoId}/completion
  toggleCompletion: async ({todoId}) => {
    const res = await api.post(`/api/todos/${todoId}/completion`);
    return res.data;
  },

  // DELETE /api/todos/{todoId}
  deleteTodo: async ({todoId}) => {
    // console.log("투두 삭제 todoId: ", todoId);
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
