"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Subject, Note, DeletedItem, Task } from "@/types";
import {
  authAPI,
  subjectAPI,
  noteAPI,
  taskAPI,
  trashAPI,
} from "@/lib/api";

const SUBJECT_COLORS = [
  "#6366F1", "#10B981", "#EF4444", "#F59E0B",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
];

interface AppContextType {
  subjects: Subject[];
  notes: Note[];
  deletedItems: DeletedItem[];
  tasks: Task[];
  createSubject: (name: string) => Promise<Subject>;
  deleteSubject: (id: string) => Promise<void>;
  createNote: (title: string, subjectId: string) => Promise<Note>;
  updateNote: (id: string, content: string, title?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreItem: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  createTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredSubjects: Subject[];
  user: { id: string; name: string; email: string } | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDataLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchNotes: (subjectId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects]         = useState<Subject[]>([]);
  const [notes, setNotes]               = useState<Note[]>([]);
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [user, setUser]                 = useState<{ id: string; name: string; email: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 1. Recover session on mount
  useEffect(() => {
    const recoverSession = async () => {
      const token = localStorage.getItem("omninote_token");
      if (token) {
        try {
          const res = await authAPI.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (_) {
          localStorage.removeItem("omninote_token");
        }
      }
      setIsAuthLoading(false);
    };
    recoverSession();
  }, []);

  // 2. Fetch data once authenticated
  useEffect(() => {
    if (user) {
      const fetchInitialData = async () => {
        try {
          setIsDataLoading(true);
          const subjectsRes = await subjectAPI.list();
          if (subjectsRes.success && subjectsRes.data) {
            setSubjects(subjectsRes.data);
          }
          const tasksRes = await taskAPI.list();
          if (tasksRes.success && tasksRes.data) {
            setTasks(tasksRes.data);
          }
        } catch (e) {
          console.error("Error loading user records:", e);
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchInitialData();
    } else {
      // Clear data on logout
      setSubjects([]);
      setNotes([]);
      setTasks([]);
      setIsDataLoading(false);
    }
  }, [user]);

  // Auth Operations
  const login = useCallback(async (email: string, password?: string): Promise<void> => {
    try {
      const res = await authAPI.login({ email, password: password || "" });
      if (res.success && res.data) {
        localStorage.setItem("omninote_token", res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error(res.message || "Login failed");
      }
    } catch (e: any) {
      console.error(e);
      const errMsg = e.message || "Login failed";
      throw new Error(errMsg);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password?: string): Promise<void> => {
    try {
      const res = await authAPI.register({ name, email, password: password || "" });
      if (!res.success) {
        throw new Error(res.message || "Registration failed");
      }
      // Do NOT auto-login. Let user sign in manually on the login page.
    } catch (e: any) {
      console.error(e);
      const errMsg = e.errors?.[0]?.message || e.message || "Registration failed";
      throw new Error(errMsg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error("Backend logout error:", e);
    } finally {
      localStorage.removeItem("omninote_token");
      setUser(null);
    }
  }, []);

  // Asynchronous Folder (Subject) Operations
  const createSubject = useCallback(async (name: string): Promise<Subject> => {
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    const res = await subjectAPI.create({ name, color });
    if (res.success && res.data) {
      const newSubject: Subject = res.data;
      setSubjects(prev => [...prev, newSubject]);
      return newSubject;
    }
    throw new Error("Failed to create subject folder");
  }, [subjects.length]);

  const deleteSubject = useCallback(async (id: string) => {
    const res = await subjectAPI.softDelete(id);
    if (res.success) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      setNotes(prev => prev.filter(n => n.subjectId !== id));
    }
  }, []);

  // Asynchronous Note Operations
  const fetchNotes = useCallback(async (subjectId: string) => {
    try {
      const res = await noteAPI.list(subjectId);
      if (res.success && res.data) {
        setNotes(prev => {
          const filtered = prev.filter(n => n.subjectId !== subjectId);
          return [...filtered, ...res.data];
        });
      }
    } catch (e) {
      console.error("fetchNotes error:", e);
    }
  }, []);

  const createNote = useCallback(async (title: string, subjectId: string): Promise<Note> => {
    const res = await noteAPI.create({ title, subjectId });
    if (res.success && res.data) {
      const newNote: Note = res.data;
      setNotes(prev => [...prev, newNote]);
      setSubjects(prev =>
        prev.map(s => s.id === subjectId ? { ...s, noteCount: s.noteCount + 1 } : s)
      );
      return newNote;
    }
    throw new Error("Failed to create note record");
  }, []);

  const updateNote = useCallback(async (id: string, content: string, title?: string) => {
    const res = await noteAPI.update(id, { content, title });
    if (res.success && res.data) {
      setNotes(prev =>
        prev.map(n => n.id === id ? { ...n, content, title: title || n.title, updatedAt: new Date().toISOString() } : n)
      );
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const res = await noteAPI.softDelete(id);
    if (res.success) {
      setNotes(prev => prev.filter(n => n.id !== id));
      setSubjects(prev =>
        prev.map(s => s.id === note.subjectId ? { ...s, noteCount: Math.max(0, s.noteCount - 1) } : s)
      );
    }
  }, [notes]);

  const restoreItem = useCallback(async (id: string) => {
    // Determine restoration type from backend/trash context (handled in UI trash, let's fetch trash dynamically on trash page)
  }, []);

  const permanentlyDelete = useCallback(async (id: string) => {
    // Purges from trash are handled by backend /trash/empty globally or by API
  }, []);

  // Asynchronous Task Operations
  const createTask = useCallback(async (title: string) => {
    const res = await taskAPI.create({ text: title });
    if (res.success && res.data) {
      setTasks(prev => [res.data, ...prev]);
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const res = await taskAPI.toggle(id);
    if (res.success && res.data) {
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: res.data.completed } : t)
      );
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await taskAPI.delete(id);
    if (res.success) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppContext.Provider value={{
      subjects, notes, deletedItems, tasks,
      createSubject, deleteSubject,
      createNote, updateNote, deleteNote,
      restoreItem, permanentlyDelete,
      createTask, toggleTask, deleteTask,
      searchQuery, setSearchQuery, filteredSubjects,
      user, isLoggedIn: !!user, isAuthLoading, isDataLoading, login, signup, logout, fetchNotes
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}