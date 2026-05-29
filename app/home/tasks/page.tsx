"use client";

import { useState, useRef, useEffect } from "react";
import { CheckSquare, Trash2, CheckCircle2, Circle, Plus, ListTodo } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function TasksPage() {
  const { tasks, createTask, toggleTask, deleteTask } = useApp();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    try {
      await createTask(trimmed);
      toast(`Task "${trimmed}" created`, "success");
      setInput("");
      inputRef.current?.focus();
    } catch (e) {
      console.error(e);
      toast("Failed to create task", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleToggle = async (id: string, currentText: string, currentlyCompleted: boolean) => {
    try {
      await toggleTask(id);
      toast(currentlyCompleted ? "Task marked as active" : "Task completed!", "success");
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteTask(deleteTargetId);
      toast("Task deleted successfully", "info");
    } catch (e) {
      console.error(e);
      toast("Failed to delete task", "error");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-950/20">
      
      {/* Visual Header */}
      <div className="px-8 md:px-12 py-6 border-b border-gray-150/30 dark:border-gray-850 bg-white dark:bg-gray-900/60 backdrop-blur-md sticky top-0 z-30 transition">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none flex items-center gap-2.5">
          <CheckSquare className="w-5.5 h-5.5 text-indigo-500" />
          My Tasks
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold mt-1">
          Stay organized and trace your assignments
        </p>
      </div>

      <div className="flex-1 px-8 md:px-12 py-8 flex flex-col gap-6 max-w-4xl w-full mx-auto animate-in fade-in duration-300">
        
        {/* Modern input block */}
        <div className="flex items-center gap-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] px-5 py-3 shadow-sm hover:shadow-md transition duration-250">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new homework, study target, or chore..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10">
            <ListTodo className="w-12 h-12 text-gray-200 dark:text-gray-750 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500 dark:text-gray-400 text-xs.5 leading-relaxed max-w-xs">
              No tasks yet. Stay organized by typing in assignments or study goals above!
            </p>
          </div>
        )}

        {/* Pending list */}
        {pending.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Active Tasks</h2>
            {pending.map(task => (
              <TaskRow
                key={task.id}
                title={task.text}
                completed={false}
                onToggle={() => handleToggle(task.id, task.text, false)}
                onDelete={() => setDeleteTargetId(task.id)}
              />
            ))}
          </div>
        )}

        {/* Completed list */}
        {completed.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-4">
            <div className="flex items-center gap-2 mb-1 px-2 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Completed ({completed.length})
              </span>
            </div>
            {completed.map(task => (
              <TaskRow
                key={task.id}
                title={task.text}
                completed={true}
                onToggle={() => handleToggle(task.id, task.text, true)}
                onDelete={() => setDeleteTargetId(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Task?"
        message="Are you sure you want to permanently delete this task item? This action is immediate and cannot be undone."
        confirmLabel="Delete Task"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

function TaskRow({
  title,
  completed,
  onToggle,
  onDelete,
}: {
  title: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] px-5 py-3.5 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          onClick={onToggle}
          className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors cursor-pointer"
        >
          {completed
            ? <CheckCircle2 className="w-5.5 h-5.5 text-indigo-550 fill-indigo-500/10" />
            : <Circle className="w-5.5 h-5.5 hover:text-indigo-400" />
          }
        </button>
        <span
          className={`text-sm leading-relaxed truncate min-w-0 flex-1 ${
            completed
              ? "text-gray-450 dark:text-gray-505 line-through font-semibold"
              : "text-gray-700 dark:text-gray-200 font-bold"
          }`}
        >
          {title}
        </span>
      </div>
      
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 duration-200 cursor-pointer shrink-0"
        title="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}