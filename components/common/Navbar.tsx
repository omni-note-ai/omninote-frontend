"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, CheckSquare, Trash2, LogOut, PenLine } from "lucide-react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/common/ToastProvider";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast("Logged out successfully", "info");
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      {/* Brand logo left */}
      <Link href="/home" className="flex items-center gap-2 text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
        <PenLine className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.2} />
        <span className="font-bold text-lg tracking-tight">OmniNotes.</span>
      </Link>

      {/* Nav icons right */}
      <div className="flex items-center gap-5.5">
        <Link
          href="/home"
          className={`p-1.5 rounded-lg transition-colors duration-200 ${
            pathname === "/home"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title="Home"
        >
          <Home className="w-5 h-5" strokeWidth={1.8} />
        </Link>
        <Link
          href="/home/tasks"
          className={`p-1.5 rounded-lg transition-colors duration-200 ${
            pathname === "/home/tasks"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title="Tasks"
        >
          <CheckSquare className="w-5 h-5" strokeWidth={1.8} />
        </Link>
        <Link
          href="/recently-deleted"
          className={`p-1.5 rounded-lg transition-colors duration-200 ${
            pathname === "/recently-deleted"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
          title="Trash"
        >
          <Trash2 className="w-5 h-5" strokeWidth={1.8} />
        </Link>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
