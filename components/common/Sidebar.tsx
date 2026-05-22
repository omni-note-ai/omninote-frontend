"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Trash2, PenLine } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/home/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/recently-deleted", label: "Recently Deleted", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 250,
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #F0F0F0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingLeft: 8,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: "#ECEEFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PenLine size={20} color="#6366F1" strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.3px",
            }}
          >
            OmniNotes
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 16,
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#5B5FEF" : "#374151",
                  backgroundColor: isActive ? "#EEEFFF" : "transparent",
                  border: isActive ? "1.5px solid #C7C9F9" : "1.5px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon
                  size={18}
                  color={isActive ? "#5B5FEF" : "#6B7280"}
                  strokeWidth={2}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 16,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "#C7C9F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5B5FEF",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            H
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            hoperochelleandales
          </span>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#EF4444",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}