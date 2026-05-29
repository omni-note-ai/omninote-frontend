import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ToastProvider } from "@/components/common/ToastProvider";
import CommandPalette from "@/components/common/CommandPalette";

export const metadata: Metadata = {
  title: "OmniNotes",
  description: "Your all-in-one note-taking app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try { if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark'); } catch(_) {}`
        }} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <AppProvider>
          <ToastProvider>
            {children}
            <CommandPalette />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}