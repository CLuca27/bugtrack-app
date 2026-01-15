import {api} from "./client";

export const login = (email, password) =>
  api.post("users/login", { email, password });

export const register = (email, password) =>
  api.post("users/register", { email, password});

export  const profile = () =>
  api.get("users/profile"); 


