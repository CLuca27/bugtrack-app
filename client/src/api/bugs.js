import { api } from "./client";

export const getBugsByProject = (projectId) => api.get(`/bugs?projectId=${projectId}`);
export const createBug = (data) => api.post("/bugs", data);
export const assignBug = (bugId) => api.put(`/bugs/${bugId}/assign`);
export const updateBugStatus = (bugId, data) => api.put(`/bugs/${bugId}`, data);