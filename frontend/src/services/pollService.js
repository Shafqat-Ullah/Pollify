import api from "./api";

export const pollService = {
  list: (params) => api.get("/polls", { params }).then((r) => r.data),
  typeStats: () => api.get("/polls/trending").then((r) => r.data),
  get: (id) => api.get(`/polls/${id}`).then((r) => r.data),
  create: (payload) => api.post("/polls", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/polls/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/polls/${id}`).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/polls/${id}/status`, { status }).then((r) => r.data),
  vote: (id, selectedOptions) => api.post(`/polls/${id}/vote`, { selectedOptions }).then((r) => r.data),
  unvote: (id) => api.post(`/polls/${id}/unvote`).then((r) => r.data),
  results: (id) => api.get(`/polls/${id}/results`).then((r) => r.data),
  like: (id) => api.post(`/polls/${id}/like`).then((r) => r.data),
  bookmark: (id) => api.post(`/polls/${id}/bookmark`).then((r) => r.data),
  getComments: (id) => api.get(`/polls/${id}/comments`).then((r) => r.data),
  addComment: (id, content, parentComment) =>
    api.post(`/polls/${id}/comments`, { content, parentComment }).then((r) => r.data),
  deleteComment: (id, commentId) => api.delete(`/polls/${id}/comments/${commentId}`).then((r) => r.data),
  report: (id, reason, details) => api.post(`/polls/${id}/report`, { reason, details }).then((r) => r.data),
};

export const userService = {
  getDashboard: () => api.get("/users/me/dashboard").then((r) => r.data),
  getProfile: (username) => api.get(`/users/${username}`).then((r) => r.data),
  updateProfile: (payload) => api.put("/users/me", payload).then((r) => r.data),
  updateAvatar: (formData) =>
    api.put("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  changePassword: (payload) => api.put("/users/me/password", payload).then((r) => r.data),
  getMyVotes: () => api.get("/users/me/votes").then((r) => r.data),
  getMyBookmarks: () => api.get("/users/me/bookmarks").then((r) => r.data),
  toggleFollow: (id) => api.post(`/users/${id}/follow`).then((r) => r.data),
};

export const categoryService = {
  list: () => api.get("/categories").then((r) => r.data),
};

export const notificationService = {
  list: () => api.get("/notifications").then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};
