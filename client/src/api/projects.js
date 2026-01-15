import { api } from "./client";

export const getMyProjects = () => api.get("/projects"); 
export const getAvailableProjects = () => api.get("/projects/available");
export const createProject = (data) => api.post("/projects/create", data);
export const becomeTester = (projectId) => api.post(`/projects/${projectId}/add-tester`);