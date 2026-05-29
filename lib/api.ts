import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic token injection interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("omninote_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token expiry / unauthenticated requests
api.interceptors.response.use(
  (response) => {
    // If the backend envelope is { success, data, message }, Axios response.data holds it.
    // The user's interceptor returns response.data directly.
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Clear local session if token is invalid, expired or revoked
        localStorage.removeItem("omninote_token");
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Typed API Methods for Store Integration
 */

// 1. Auth Services
export const authAPI = {
  register: (data: any): Promise<any> => api.post("/auth/register", data),
  login: (data: any): Promise<any> => api.post("/auth/login", data),
  getProfile: (): Promise<any> => api.get("/auth/me"),
  logout: (): Promise<any> =>
    api.post("/auth/logout").then(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("omninote_token");
      }
    }),
};

// 2. Subject Services
export const subjectAPI = {
  list: (): Promise<any> => api.get("/subjects"),
  create: (data: { name: string; color: string }): Promise<any> => api.post("/subjects", data),
  softDelete: (id: string): Promise<any> => api.patch(`/subjects/${id}/soft-delete`),
  restore: (id: string): Promise<any> => api.patch(`/subjects/${id}/restore`),
};

// 3. Note Services (Autosave supports both PUT & PATCH)
export const noteAPI = {
  list: (subjectId: string): Promise<any> => api.get(`/notes?subjectId=${subjectId}`),
  get: (id: string): Promise<any> => api.get(`/notes/${id}`),
  create: (data: { subjectId: string; title?: string }): Promise<any> => api.post("/notes", data),
  update: (id: string, data: { title?: string; content?: string }): Promise<any> => api.put(`/notes/${id}`, data),
  softDelete: (id: string): Promise<any> => api.patch(`/notes/${id}/soft-delete`),
  restore: (id: string): Promise<any> => api.patch(`/notes/${id}/restore`),
};

// 4. Task Services
export const taskAPI = {
  list: (): Promise<any> => api.get("/tasks"),
  create: (data: { text: string }): Promise<any> => api.post("/tasks", data),
  toggle: (id: string): Promise<any> => api.patch(`/tasks/${id}/toggle`),
  delete: (id: string): Promise<any> => api.delete(`/tasks/${id}`),
};

// 5. Image & OCR Services
export const imageAPI = {
  upload: (noteId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("noteId", noteId);
    formData.append("file", file);
    return api.post("/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string): Promise<any> => api.delete(`/images/${id}`),
  runOCR: (imageId: string): Promise<any> => api.post("/ai/ocr", { imageId }),
};

// 6. AI & Search Services
export const aiAPI = {
  summarize: (content: string): Promise<any> => api.post("/ai/summarize", { content }),
};

export const searchAPI = {
  query: (q: string): Promise<any> => api.get(`/search?q=${encodeURIComponent(q)}`),
};

// 7. Trash Recovery Services
export const trashAPI = {
  getTrash: (): Promise<any> => api.get("/trash"),
  emptyTrash: (): Promise<any> => api.delete("/trash/empty"),
};
