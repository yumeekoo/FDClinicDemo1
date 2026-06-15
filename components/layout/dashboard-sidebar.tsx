"use client";

import React, { useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { BranchSelector } from "@/components/modules/branch/branch-selector";

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

interface DashboardSidebarProps {
  fullName: string;
  role: string;
}

export function DashboardSidebar({ fullName, role }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links: SidebarLink[] = [
    {
      href: "/admin",
      label: "Tổng quan Admin",
      roles: ["ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      href: "/admin/branches",
      label: "Quản lý Chi nhánh",
      roles: ["ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      href: "/admin/users",
      label: "Quản lý Nhân viên",
      roles: ["ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: "/admin/inventory",
      label: "Kho thuốc & Thiết bị",
      roles: ["ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: "/admin/appointments",
      label: "Quản lý Lịch hẹn",
      roles: ["ADMIN", "BRANCH_ADMIN", "RECEPTION"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: "/reception",
      label: "Tiếp đón bệnh nhân",
      roles: ["RECEPTION", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      href: "/reception/queue",
      label: "Hàng đợi tiếp đón",
      roles: ["RECEPTION", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: "/doctor",
      label: "Phòng khám bác sĩ",
      roles: ["DOCTOR", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      href: "/paraclinical",
      label: "Khu Cận lâm sàng",
      roles: ["PARACLINICAL", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/cashier",
      label: "Quầy thu ngân",
      roles: ["CASHIER", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/pharmacy",
      label: "Quầy phát thuốc",
      roles: ["PHARMACIST", "ADMIN", "BRANCH_ADMIN"],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  return (
    <aside 
      className={`relative border-r border-[var(--sidebar-border,var(--border))] bg-[var(--sidebar-bg)] flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[88px]" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-blue-600 shadow-sm z-10 transition-transform hover:scale-110"
        title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        {isCollapsed ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      {/* Brand */}
      <div className={`h-16 flex items-center border-b border-[var(--sidebar-border,var(--border))] transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
            CH
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-xl text-white whitespace-nowrap overflow-hidden transition-opacity duration-300">
              Clinic Hub
            </span>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className={`mx-3 my-4 rounded-xl border border-white/10 bg-white/5 transition-all duration-300 ${isCollapsed ? 'p-2 flex justify-center' : 'p-4'}`}>
        {isCollapsed ? (
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium border border-white/20 flex-shrink-0" title={fullName}>
            {fullName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium border border-white/20 flex-shrink-0">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-100">{fullName}</p>
                <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold tracking-wider uppercase rounded bg-blue-500/20 text-blue-300">
                  {role}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <BranchSelector role={role} />
            </div>
          </>
        )}
      </div>

      {/* Links */}
      <SidebarNav links={links} role={role} isCollapsed={isCollapsed} />

      {/* Logout Actions */}
      <div className="p-4 border-t border-[var(--sidebar-border,var(--border))]">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            title="Đăng xuất"
            className={`flex items-center justify-center rounded-lg text-sm font-semibold text-[var(--sidebar-muted)] hover:text-red-400 hover:bg-red-500/10 transition duration-150 ${isCollapsed ? 'w-10 h-10 mx-auto p-0' : 'w-full space-x-2 px-4 py-2.5'}`}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Đăng xuất</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
