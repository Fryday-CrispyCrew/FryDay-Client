// src/features/todo/queries/category/categoryApi.js
import api from "../../../../shared/lib/api"; // ✅ 프로젝트 내 api.js 위치에 맞게 경로만 조정

export const categoryApi = {
  // GET /api/categories
  getCategories: async () => {
    const res = await api.get("/api/categories");
    return res.data; // { success, message, data: [...], timestamp }
  },

  // POST /api/categories
  createCategory: async ({name, color}) => {
    const res = await api.post("/api/categories", {name, color});
    return res.data; // { success, message, data: { id, name, color }, ... }
  },

  // PATCH /api/categories/{categoryId}
  updateCategory: async ({categoryId, name, color}) => {
    const res = await api.patch(`/api/categories/${categoryId}`, {name, color});
    return res.data;
  },

  // DELETE /api/categories/{categoryId}
  deleteCategory: async ({categoryId}) => {
    const res = await api.delete(`/api/categories/${categoryId}`);
    return res.data;
  },

  // PATCH /api/categories/reorder  (⚠️ 명세 제목은 /order, 예시는 /reorder)
  reorderCategories: async ({ids}) => {
    const res = await api.patch("/api/categories/reorder", {ids});
    return res.data;
  },
};
