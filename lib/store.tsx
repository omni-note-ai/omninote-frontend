"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Subject, Note, DeletedItem } from "@/types";

const SUBJECT_COLORS = [
  "#F59E0B","#6366F1","#10B981","#EF4444",
  "#8B5CF6","#EC4899","#14B8A6","#F97316",
];

const MOCK_SUBJECTS: Subject[] = [
  { id: "s1", name: "Mathematics", color: "#6366F1", noteCount: 2, createdAt: "2026-05-01T08:00:00Z" },
  { id: "s2", name: "Physics",     color: "#F59E0B", noteCount: 1, createdAt: "2026-05-02T09:00:00Z" },
  { id: "s3", name: "History",     color: "#10B981", noteCount: 1, createdAt: "2026-05-03T10:00:00Z" },
];

const MOCK_NOTES: Note[] = [
  { id: "n1", title: "Calculus Basics",       content: "Derivatives and integrals...", subjectId: "s1", subjectName: "Mathematics", createdAt: "2026-05-10T08:00:00Z", updatedAt: "2026-05-10T08:00:00Z" },
  { id: "n2", title: "Algebra Review",        content: "Linear equations...",           subjectId: "s1", subjectName: "Mathematics", createdAt: "2026-05-11T08:00:00Z", updatedAt: "2026-05-11T08:00:00Z" },
  { id: "n3", title: "Newton's Laws",         content: "Force = mass × acceleration",  subjectId: "s2", subjectName: "Physics",     createdAt: "2026-05-12T08:00:00Z", updatedAt: "2026-05-12T08:00:00Z" },
  { id: "n4", title: "World War II Timeline", content: "1939 – 1945...",                subjectId: "s3", subjectName: "History",     createdAt: "2026-05-13T08:00:00Z", updatedAt: "2026-05-13T08:00:00Z" },
];

const MOCK_DELETED: DeletedItem[] = [
  { id: "d1", title: "Old Chemistry Notes", type: "note",    subjectName: "Chemistry", deletedAt: "2026-05-20T10:00:00Z", originalData: {} as Note },
  { id: "d2", title: "Biology",             type: "subject", deletedAt: "2026-05-19T10:00:00Z", originalData: {} as Subject },
];

interface AppContextType {
  subjects: Subject[];
  notes: Note[];
  deletedItems: DeletedItem[];
  createSubject: (name: string) => Subject;
  deleteSubject: (id: string) => void;
  createNote: (title: string, subjectId: string) => Note;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredSubjects: Subject[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects]         = useState<Subject[]>(MOCK_SUBJECTS);
  const [notes, setNotes]               = useState<Note[]>(MOCK_NOTES);
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>(MOCK_DELETED);
  const [searchQuery, setSearchQuery]   = useState("");

  const createSubject = (name: string): Subject => {
    const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
    const s: Subject = { id: crypto.randomUUID(), name, color, noteCount: 0, createdAt: new Date().toISOString() };
    setSubjects(prev => [...prev, s]);
    return s;
  };

  const deleteSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    setDeletedItems(prev => [{ id: crypto.randomUUID(), title: subject.name, type: "subject", deletedAt: new Date().toISOString(), originalData: subject }, ...prev]);
    setSubjects(prev => prev.filter(s => s.id !== id));
    setNotes(prev => prev.filter(n => n.subjectId !== id));
  };

  const createNote = (title: string, subjectId: string): Note => {
    const subject = subjects.find(s => s.id === subjectId);
    const n: Note = { id: crypto.randomUUID(), title, content: "", subjectId, subjectName: subject?.name ?? "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setNotes(prev => [...prev, n]);
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, noteCount: s.noteCount + 1 } : s));
    return n;
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setDeletedItems(prev => [{ id: crypto.randomUUID(), title: note.title, type: "note", subjectName: note.subjectName, deletedAt: new Date().toISOString(), originalData: note }, ...prev]);
    setNotes(prev => prev.filter(n => n.id !== id));
    setSubjects(prev => prev.map(s => s.id === note.subjectId ? { ...s, noteCount: Math.max(0, s.noteCount - 1) } : s));
  };

  const restoreItem = (id: string) => {
    const item = deletedItems.find(d => d.id === id);
    if (!item) return;
    if (item.type === "note") {
      const note = item.originalData as Note;
      if (note.id) {
        setNotes(prev => [...prev, note]);
        setSubjects(prev => prev.map(s => s.id === note.subjectId ? { ...s, noteCount: s.noteCount + 1 } : s));
      }
    } else {
      const subject = item.originalData as Subject;
      if (subject.id) setSubjects(prev => [...prev, subject]);
    }
    setDeletedItems(prev => prev.filter(d => d.id !== id));
  };

  const permanentlyDelete = (id: string) => {
    setDeletedItems(prev => prev.filter(d => d.id !== id));
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppContext.Provider value={{ subjects, notes, deletedItems, createSubject, deleteSubject, createNote, updateNote, deleteNote, restoreItem, permanentlyDelete, searchQuery, setSearchQuery, filteredSubjects }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}