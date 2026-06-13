"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

export function SidebarNav({ links, role }: { links: SidebarLink[]; role: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto sidebar-scroll my-2">
      {links
        .filter((link) => link.roles.includes(role))
        .map((link) => {
          // Xử lý active state chính xác cho trang tổng quan (tránh match tất cả các sub-routes)
          const isActive = link.href.split("/").length <= 2 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                isActive
                  ? "bg-[var(--sidebar-active-bg)] text-white font-semibold border-l-2 border-white"
                  : "text-[var(--sidebar-muted)] font-medium hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-fg)]"
              }`}
            >
              <div className={`flex-shrink-0 flex items-center justify-center ${isActive ? "text-white" : "text-inherit opacity-80"}`}>
                {link.icon}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}
