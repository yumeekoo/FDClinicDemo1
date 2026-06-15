"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { getBranchesAction, switchActiveBranchAction } from "@/actions/branches";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface BranchContextType {
  activeBranchId: string | null;
  activeBranchName: string | null;
  branches: Branch[];
  isPending: boolean;
  switchBranch: (branchId: string) => Promise<void>;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({
  children,
  initialBranchId,
  initialBranchName,
}: {
  children: React.ReactNode;
  initialBranchId: string | null;
  initialBranchName: string | null;
}) {
  const [activeBranchId, setActiveBranchId] = useState<string | null>(initialBranchId);
  const [activeBranchName, setActiveBranchName] = useState<string | null>(initialBranchName);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const refreshBranches = async () => {
    const res = await getBranchesAction();
    if (res.success) {
      setBranches(res.data);
    } else {
      console.error(res.error);
    }
  };

  useEffect(() => {
    refreshBranches();
  }, []);

  const switchBranch = async (branchId: string) => {
    const res = await switchActiveBranchAction(branchId);
    if (res.success) {
      startTransition(() => {
        setActiveBranchId(res.data.id);
        setActiveBranchName(res.data.name);
        router.refresh();
      });
      toast.success(`Đã chuyển sang chi nhánh: ${res.data.name}`);
    } else {
      toast.error(res.error || "Không thể chuyển chi nhánh");
    }
  };

  return (
    <BranchContext.Provider
      value={{
        activeBranchId,
        activeBranchName,
        branches,
        isPending,
        switchBranch,
        refreshBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
