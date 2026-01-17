// src/features/todo/queries/sheet/sheetApi.js
import api from "../../../../shared/lib/api";
// ✅ 위 경로는 예시야. 실제 api.js 위치에 맞게 조정해줘.

export const sheetApi = {
  // 투두 생성: POST /api/todos
  createTodo: async ({description, categoryId}) => {
    const res = await api.post("/api/todos", {description, categoryId});
    return res.data;
  },

  // 투두 단건 조회: GET /api/todos/{todoId}
  getTodoDetail: async ({todoId}) => {
    const res = await api.get(`/api/todos/${todoId}`);
    return res.data;
  },

  // 투두 내용 수정: PATCH /api/todos/{todoId}/description
  updateDescription: async ({todoId, description}) => {
    console.log("제목 수정");
    const res = await api.patch(`/api/todos/${todoId}/description`, {
      description,
    });
    return res.data;
  },

  // 투두 메모: PATCH /api/todos/{todoId}/memo
  updateMemo: async ({todoId, memo}) => {
    console.log("메모 수정");
    const res = await api.patch(`/api/todos/${todoId}/memo`, {memo});
    return res.data;
  },

  // 투두 날짜 변경: PATCH /api/todos/{todoId}/date
  updateDate: async ({todoId, date}) => {
    console.log("날짜 수정");
    const res = await api.patch(`/api/todos/${todoId}/date`, {date});
    return res.data;
  },

  // 투두 카테고리 변경: PATCH /api/todos/{todoId}/category
  updateCategory: async ({todoId, categoryId}) => {
    console.log("카테고리 수정");
    const res = await api.patch(`/api/todos/${todoId}/category`, {categoryId});
    return res.data;
  },

  // 개별 투두 알림 설정: POST /api/todos/{todoId}/alarm
  setAlarm: async ({todoId, notifyAt}) => {
    console.log("알림 설정");
    const res = await api.post(`/api/todos/${todoId}/alarm`, {notifyAt});
    return res.data;
  },

  // 개별 투두 알림 삭제: DELETE /api/todos/{todoId}/alarm
  deleteAlarm: async ({todoId}) => {
    console.log("알림 삭제");
    const res = await api.delete(`/api/todos/${todoId}/alarm`);
    return res.data;
  },

  // 투두 반복 설정: POST /api/todos/recurrence
  createRecurrence: async ({
    todoId,
    type,
    frequencyValues,
    startDate,
    endDate = null,
    notificationTime = null,
  }) => {
    console.log("반복 설정 생성");
    console.log("todoId: ", todoId);
    console.log("type: ", type);
    console.log("frequencyValues: ", frequencyValues);
    console.log("startDate: ", startDate);
    console.log("endDate: ", endDate);
    console.log("notificationTime: ", notificationTime);
    const res = await api.post("/api/todos/recurrence", {
      todoId,
      type,
      frequencyValues,
      startDate,
      endDate,
      notificationTime,
    });
    return res.data;
  },

  // 반복 투두 규칙 수정: PATCH /api/todos/recurrence/{recurrenceId}
  updateRecurrenceRule: async ({
    recurrenceId,
    type,
    frequencyValues, // optional
    startDate,
    endDate = null,
    notificationTime = null,
  }) => {
    console.log("반복 설정 수정");
    console.log("recurrenceId: ", recurrenceId);
    console.log("type: ", type);
    console.log("frequencyValues: ", frequencyValues);
    console.log("startDate: ", startDate);
    console.log("endDate: ", endDate);
    console.log("notificationTime: ", notificationTime);

    const res = await api.patch(`/api/todos/recurrence/${recurrenceId}`, {
      type,
      ...(frequencyValues ? {frequencyValues} : {}),
      startDate,
      endDate,
      notificationTime,
    });
    return res.data;
  },

  // 반복 설정된 투두 회차 분리: POST /api/todos/recurrence/{recurrenceId}/detach
  detachRecurrenceOccurrence: async ({
    recurrenceId,
    occurrenceDate,
    newDate,
  }) => {
    const res = await api.post(`/api/todos/recurrence/${recurrenceId}/detach`, {
      occurrenceDate,
      newDate,
    });
    return res.data;
  },
};
