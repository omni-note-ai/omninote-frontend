"use client";

import { useState, useRef, useEffect } from "react";
import { CheckSquare, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useApp } from "@/lib/store";

export default function TasksPage() {
  const { tasks, createTask, toggleTask, deleteTask } = useApp();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    createTask(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <div className="px-10 py-8 bg-gray-50 dark:bg-gray-950">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Tasks</h1>
      </div>

      <div className="flex-1 px-10 pb-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task (e.g., Finish Math Assignment)"
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            Add Task
          </button>
        </div>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
            <CheckSquare className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-4" strokeWidth={1.5} />
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              No tasks yet. Stay organized by adding your assignments here!
            </p>
          </div>
        )}

        {pending.length > 0 && (
          <div className="flex flex-col gap-2">
            {pending.map(task => (
              <TaskRow
                key={task.id}
                title={task.title}
                completed={false}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Completed ({completed.length})
              </span>
            </div>
            {completed.map(task => (
              <TaskRow
                key={task.id}
                title={task.title}
                completed={true}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
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
    <div className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          {completed
            ? <CheckCircle2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            : <Circle className="w-5 h-5" />
          }
        </button>
        <span
          className={
            completed
              ? "text-sm text-gray-400 dark:text-gray-500 line-through"
              : "text-sm text-gray-700 dark:text-gray-200"
          }
        >
          {title}
        </span>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </button>
    </div>
  );
}