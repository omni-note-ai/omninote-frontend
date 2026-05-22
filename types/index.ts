export interface Subject {
  id: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  subjectName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedItem {
  id: string;
  title: string;
  type: "note" | "subject";
  subjectName?: string;
  deletedAt: string;
  originalData: Note | Subject;
}