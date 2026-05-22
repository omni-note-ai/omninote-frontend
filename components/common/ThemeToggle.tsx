"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}