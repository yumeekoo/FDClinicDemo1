"use client";

import React from "react";
import { useBranch } from "@/hooks/use-branch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BranchSelectorProps {
  role: string;
}

export function BranchSelector({ role }: BranchSelectorProps) {
  const { activeBranchId, activeBranchName, branches, switchBranch, isPending } = useBranch();

  const isSystemAdmin = role === "ADMIN";

  if (!isSystemAdmin) {
    return (
      <div className="flex items-center space-x-1.5 text-gray-500">
        <svg className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="truncate text-[11px]" title={activeBranchName || "Chưa xác định"}>
          {activeBranchName || "Chưa xác định"}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="flex w-full items-center justify-between space-x-1.5 text-left text-gray-500 hover:text-gray-900 transition duration-150 group"
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          <svg className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate text-[11px] font-semibold text-blue-400 decoration-dotted underline underline-offset-2 decoration-blue-500/50">
            {activeBranchName || "Chọn chi nhánh..."}
          </span>
        </div>
        <svg className="h-3 w-3 text-gray-500 group-hover:text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-50 border-gray-200 text-gray-900 w-56">
        <DropdownMenuLabel className="text-gray-500 text-xs font-semibold">
          Chuyển chi nhánh làm việc
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white" />
        {branches.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onClick={() => switchBranch(b.id)}
            className={`cursor-pointer text-xs flex justify-between items-center ${
              b.id === activeBranchId
                ? "bg-blue-600/20 text-blue-400 font-bold hover:bg-blue-600/20 hover:text-blue-400"
                : "hover:bg-white hover:text-white"
            }`}
          >
            <span className="truncate">{b.name}</span>
            {b.id === activeBranchId && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
