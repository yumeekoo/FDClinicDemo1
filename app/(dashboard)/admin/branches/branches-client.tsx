"use client";

import React, { useState, useTransition } from "react";
import { createBranchAction, updateBranchAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface BranchesClientProps {
  initialBranches: Branch[];
}

export function BranchesClient({ initialBranches }: BranchesClientProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>();

  const openAddModal = () => {
    setEditingBranch(null);
    reset({
      name: "",
      code: "",
      address: "",
      phone: "",
      isActive: true,
    });
    setIsOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    reset({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      isActive: branch.isActive,
    });
    setIsOpen(true);
  };

  const onSubmit = (data: any) => {
    startTransition(async () => {
      let res;
      if (editingBranch) {
        res = await updateBranchAction(editingBranch.id, data);
      } else {
        res = await createBranchAction(data);
      }

      if (res.success) {
        toast.success(editingBranch ? "Cập nhật chi nhánh thành công" : "Tạo chi nhánh thành công");
        setIsOpen(false);
        // Refresh local branch state
        if (editingBranch) {
          setBranches((prev) => prev.map((b) => (b.id === editingBranch.id ? res.data : b)));
        } else {
          setBranches((prev) => [...prev, res.data]);
        }
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const toggleBranchActive = (branch: Branch) => {
    startTransition(async () => {
      const updatedData = {
        name: branch.name,
        code: branch.code,
        address: branch.address,
        phone: branch.phone,
        isActive: !branch.isActive,
      };

      const res = await updateBranchAction(branch.id, updatedData);
      if (res.success) {
        toast.success(`Đã ${branch.isActive ? "vô hiệu hóa" : "kích hoạt"} chi nhánh`);
        setBranches((prev) => prev.map((b) => (b.id === branch.id ? res.data : b)));
      } else {
        toast.error(res.error || "Không thể thay đổi trạng thái chi nhánh");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Quản lý Chi nhánh</h2>
          <p className="text-sm text-gray-500">Danh sách và cấu hình các chi nhánh trong hệ thống</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-gray-900 font-semibold text-xs py-2 px-4 rounded-xl shadow-lg shadow-blue-500/10"
        >
          Thêm Chi nhánh
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/40">
            <TableRow className="border-gray-200">
              <TableHead className="text-gray-500 font-bold">Mã</TableHead>
              <TableHead className="text-gray-500 font-bold">Tên chi nhánh</TableHead>
              <TableHead className="text-gray-500 font-bold">Điện thoại</TableHead>
              <TableHead className="text-gray-500 font-bold">Địa chỉ</TableHead>
              <TableHead className="text-gray-500 font-bold text-center">Trạng thái</TableHead>
              <TableHead className="text-gray-500 font-bold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Không tìm thấy chi nhánh nào
                </TableCell>
              </TableRow>
            ) : (
              branches.map((b) => (
                <TableRow key={b.id} className="border-gray-200/60 hover:bg-white/10 transition">
                  <TableCell className="font-mono text-xs text-blue-400">{b.code}</TableCell>
                  <TableCell className="font-semibold text-gray-900 text-xs">{b.name}</TableCell>
                  <TableCell className="text-gray-600 text-xs">{b.phone}</TableCell>
                  <TableCell className="text-gray-500 text-xs truncate max-w-xs" title={b.address}>
                    {b.address}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleBranchActive(b)}
                      disabled={isPending}
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        b.isActive
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {b.isActive ? "Hoạt động" : "Tạm dừng"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => openEditModal(b)}
                      className="text-blue-400 hover:text-white hover:bg-blue-600/10 rounded-lg text-xs h-8"
                    >
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-50 border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {editingBranch ? "Sửa thông tin chi nhánh" : "Thêm chi nhánh mới"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">
              Điền thông tin chi nhánh vào form dưới đây.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="code" className="text-xs font-semibold text-gray-600">
                Mã chi nhánh
              </Label>
              <Input
                id="code"
                placeholder="Ví dụ: CHI_NHANH_1"
                disabled={!!editingBranch || isPending}
                className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("code", { required: "Vui lòng nhập mã chi nhánh" })}
              />
              {errors.code && (
                <span className="text-[10px] text-red-400">{errors.code.message as string}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-600">
                Tên chi nhánh
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Clinic Hub Quận 1"
                disabled={isPending}
                className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("name", { required: "Vui lòng nhập tên chi nhánh" })}
              />
              {errors.name && (
                <span className="text-[10px] text-red-400">{errors.name.message as string}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold text-gray-600">
                Số điện thoại liên hệ
              </Label>
              <Input
                id="phone"
                placeholder="Ví dụ: 0281234567"
                disabled={isPending}
                className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Số điện thoại chỉ được chứa số"
                  }
                })}
              />
              {errors.phone && (
                <span className="text-[10px] text-red-400">{errors.phone.message as string}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-semibold text-gray-600">
                Địa chỉ chi nhánh
              </Label>
              <Input
                id="address"
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1, TP. HCM"
                disabled={isPending}
                className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("address", { required: "Vui lòng nhập địa chỉ" })}
              />
              {errors.address && (
                <span className="text-[10px] text-red-400">{errors.address.message as string}</span>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-200 bg-gray-50 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                {...register("isActive")}
              />
              <Label htmlFor="isActive" className="text-xs text-gray-600 select-none cursor-pointer">
                Chi nhánh hoạt động bình thường
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-200/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl text-xs h-10"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-gray-900 font-semibold text-xs h-10 rounded-xl px-6"
              >
                {isPending ? "Đang xử lý..." : editingBranch ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
