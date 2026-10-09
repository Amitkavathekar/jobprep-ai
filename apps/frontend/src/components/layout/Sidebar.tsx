"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sidebarSections } from "./sidebar-navigation";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`flex min-h-screen shrink-0 flex-col border-r border-white/10
        bg-[#07071a] p-3 text-white transition-all
        ${isOpen ? "w-60" : "w-16"}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-5 self-end rounded p-2 hover:bg-white/10"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? "‹" : "›"}
      </button>

      <nav className="flex-1 space-y-4">
        {sidebarSections.map((section) => (
          <section key={section.label}>
            {isOpen && (
              <h2 className="px-3 py-2 text-xs uppercase text-slate-400">
                {section.label}
              </h2>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/user/resume" &&
                    pathname.startsWith("/user/resume/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isOpen ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                      ${isActive ? "bg-white/10 text-cyan-400" : "text-slate-300 hover:bg-white/10"}`}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
