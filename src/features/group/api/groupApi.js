import api from "../../../shared/lib/api";

// 그룹의 403은 권한 거부이므로 토큰 갱신/로그아웃 대상으로 취급하지 않는다.
const config = { meta: { skipForbiddenRefresh: true } };
const quietConfig = { meta: { ...config.meta, skipErrorToast: true } };
const unwrap = (response) => response.data.data;

export const getGroups = () => api.get("/api/groups", config).then(unwrap);
export const groupApi = {
  getGroups,
  getGroup: (groupId) => api.get(`/api/groups/${groupId}`, config).then(unwrap),
  getMemberTodos: ({ groupId, targetUserId }) => api.get(`/api/groups/${groupId}/members/${targetUserId}/todos`, config).then(unwrap),
  createGroup: (name) => api.post("/api/groups", { name }, config).then(unwrap),
  getInvite: (inviteCode) => api.get(`/api/groups/invite/${encodeURIComponent(inviteCode)}`, quietConfig).then(unwrap),
  joinGroup: ({ inviteCode, categoryIds }) => api.post("/api/groups/join", { inviteCode, categoryIds }, quietConfig).then(unwrap),
  updateName: ({ groupId, name }) => api.patch(`/api/groups/${groupId}/name`, { name }, config).then(unwrap),
  deleteGroup: (groupId) => api.delete(`/api/groups/${groupId}`, config),
  leaveGroup: (groupId) => api.delete(`/api/groups/${groupId}/members/me`, config),
  getNotification: (groupId) => api.get(`/api/groups/${groupId}/members/me/notification`, config).then(unwrap),
  updateNotification: ({ groupId, enabled }) => api.patch(`/api/groups/${groupId}/members/me/notification`, { enabled }, config).then(unwrap),
  getPublicCategories: (groupId) => api.get(`/api/groups/${groupId}/public-categories`, config).then(unwrap),
  updatePublicCategories: ({ groupId, categoryIds }) => api.patch(`/api/groups/${groupId}/public-categories`, { categoryIds }, config).then(unwrap),
  interact: ({ groupId, targetUserId, type }) => api.post(`/api/groups/${groupId}/members/${targetUserId}/interactions`, { type }, quietConfig),
};
