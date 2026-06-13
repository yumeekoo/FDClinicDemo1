"use client";

import React, { useState, useTransition } from "react";
import { createEmployeeAction, updateEmployeeAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface Profile {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  branchId: string;
  employeeCode: string;
  isActive: boolean;
  createdAt: any;
}

interface UsersClientProps {
  initialProfiles: Profile[];
  branches: any[];
  currentUserRole: string;
  currentUserBranchId: string | null;
}

export function UsersClient({ initialProfiles, branches, currentUserRole, currentUserBranchId }: UsersClientProps) {
  const [profilesList, setProfilesList] = useState<Profile[]>(initialProfiles);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>();

  const isSuperAdmin = currentUserRole === "ADMIN";

  const openAddModal = () => {
    setEditingProfile(null);
    reset({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "RECEPTION",
      branchId: isSuperAdmin ? (branches[0]?.id || "") : (currentUserBranchId || ""),
      employeeCode: "",
      isActive: true,
    });
    setIsOpen(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    reset({
      email: "placeholder@email.com", // dummy email since it is disabled for edits
      password: "",
      fullName: profile.fullName,
      phone: profile.phone,
      role: profile.role,
      branchId: profile.branchId,
      employeeCode: profile.employeeCode,
      isActive: profile.isActive,
    });
    setIsOpen(true);
  };

  const onSubmit = (data: any) => {
    startTransition(async () => {
      let res;
      if (editingProfile) {
        // Exclude email and password for updates
        const { email, password, ...updateData } = data;
        res = await updateEmployeeAction(editingProfile.id, updateData as any);
      } else {
        res = await createEmployeeAction(data);
      }

      if (res.success) {
        toast.success(editingProfile ? "Cập nhật nhân sự thành công" : "Thêm nhân sự thành công");
        setIsOpen(false);
        // Refresh local users list
        if (editingProfile) {
          setProfilesList((prev) => prev.map((p) => (p.id === editingProfile.id ? res.data : p)));
        } else {
          setProfilesList((prev) => [...prev, res.data]);
        }
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const toggleUserActive = (profile: Profile) => {
    startTransition(async () => {
      const updateData = {
        fullName: profile.fullName,
        phone: profile.phone,
        role: profile.role,
        branchId: profile.branchId,
        employeeCode: profile.employeeCode,
        isActive: !profile.isActive,
      };

      const res = await updateEmployeeAction(profile.id, updateData as any);
      if (res.success) {
        toast.success(`Đã ${profile.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản`);
        setProfilesList((prev) => prev.map((p) => (p.id === profile.id ? res.data : p)));
      } else {
        toast.error(res.error || "Không thể thay đổi trạng thái tài khoản");
      }
    });
  };

  // Filter lists by search term
  const filteredProfiles = profilesList.filter((p) =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const getBranchName = (branchId: string) => {
    const b = branches.find((x) => x.id === branchId);
    return b ? b.name : "Không xác định";
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case "ADMIN": return "Super Admin";
      case "BRANCH_ADMIN": return "Quản trị Chi nhánh";
      case "RECEPTION": return "Lễ tân tiếp đón";
      case "DOCTOR": return "Bác sĩ lâm sàng";
      case "PARACLINICAL": return "Kỹ thuật viên CLS";
      case "CASHIER": return "Thu ngân";
      case "PHARMACIST": return "Dược sĩ cấp thuốc";
      default: return r;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Quản lý Nhân viên</h2>
          <p className="text-sm text-slate-400">Danh sách nhân sự và phân quyền vị trí làm việc</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-lg shadow-blue-500/10 self-start sm:self-auto"
        >
          Thêm Nhân viên
        </Button>
      </div>

      {/* Search box */}
      <div className="max-w-md">
        <Input
          placeholder="Tìm theo họ tên, mã nhân viên, số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/40">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-bold">Mã NV</TableHead>
              <TableHead className="text-slate-400 font-bold">Họ tên nhân viên</TableHead>
              <TableHead className="text-slate-400 font-bold">Điện thoại</TableHead>
              <TableHead className="text-slate-400 font-bold">Vai trò</TableHead>
              <TableHead className="text-slate-400 font-bold">Chi nhánh</TableHead>
              <TableHead className="text-slate-400 font-bold text-center">Trạng thái</TableHead>
              <TableHead className="text-slate-400 font-bold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  Không tìm thấy nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((p) => (
                <TableRow key={p.id} className="border-slate-800/60 hover:bg-slate-800/10 transition">
                  <TableCell className="font-mono text-xs text-blue-400">{p.employeeCode}</TableCell>
                  <TableCell className="font-semibold text-white text-xs">{p.fullName}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{p.phone}</TableCell>
                  <TableCell className="text-xs">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                      {getRoleLabel(p.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs truncate max-w-xs">
                    {getBranchName(p.branchId)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleUserActive(p)}
                      disabled={isPending}
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        p.isActive
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {p.isActive ? "Đang làm việc" : "Nghỉ việc"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => openEditModal(p)}
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editingProfile ? "Sửa hồ sơ nhân viên" : "Đăng ký nhân viên mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Nhập các thông tin đăng ký tài khoản nhân viên.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (only editable on creation) */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                Địa chỉ Email đăng nhập
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ví dụ: nhanvien@clinichub.vn"
                disabled={!!editingProfile || isPending}
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("email", { required: "Vui lòng nhập Email" })}
              />
              {errors.email && (
                <span className="text-[10px] text-red-400">{errors.email.message as string}</span>
              )}
            </div>

            {/* Password (required on creation, ignored on edit) */}
            {!editingProfile && (
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Mật khẩu đăng nhập
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                  {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                />
                {errors.password && (
                  <span className="text-[10px] text-red-400">{errors.password.message as string}</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="employeeCode" className="text-xs font-semibold text-slate-300">
                  Mã nhân viên (Code)
                </Label>
                <Input
                  id="employeeCode"
                  placeholder="Ví dụ: BS01, LT02"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                  {...register("employeeCode", { required: "Vui lòng nhập mã" })}
                />
                 {errors.employeeCode && (
                  <span className="text-[10px] text-red-400">{errors.employeeCode.message as string}</span>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-300">
                  Họ tên đầy đủ
                </Label>
                <Input
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                  {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                />
                 {errors.fullName && (
                  <span className="text-[10px] text-red-400">{errors.fullName.message as string}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-300">
                  Số điện thoại di động
                </Label>
                <Input
                  id="phone"
                  placeholder="Ví dụ: 0987654321"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                  {...register("phone", {
                    required: "Vui lòng nhập số điện thoại",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Số điện thoại chỉ gồm số"
                    }
                  })}
                />
                 {errors.phone && (
                  <span className="text-[10px] text-red-400">{errors.phone.message as string}</span>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="role" className="text-xs font-semibold text-slate-300">
                  Vai trò (Quyền hạn)
                </Label>
                <select
                  id="role"
                  disabled={isPending}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-white px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10"
                  {...register("role", { required: true })}
                >
                  <option value="RECEPTION">Lễ tân tiếp đón</option>
                  <option value="DOCTOR">Bác sĩ lâm sàng</option>
                  <option value="PARACLINICAL">Kỹ thuật viên CLS</option>
                  <option value="CASHIER">Thu ngân phòng khám</option>
                  <option value="PHARMACIST">Dược sĩ cấp phát thuốc</option>
                  <option value="BRANCH_ADMIN">Quản trị Chi nhánh</option>
                  {isSuperAdmin && <option value="ADMIN">Super Admin</option>}
                </select>
              </div>
            </div>

            {/* Branch Selector */}
            <div className="space-y-1">
              <Label htmlFor="branchId" className="text-xs font-semibold text-slate-300">
                Chi nhánh công tác
              </Label>
              <select
                id="branchId"
                disabled={!isSuperAdmin || isPending}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-white px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 disabled:opacity-60"
                {...register("branchId", { required: true })}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {!isSuperAdmin && (
                <span className="text-[9px] text-slate-500 block">
                  Cố định theo chi nhánh của bạn (Branch Admin)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActiveEmployee"
                disabled={isPending}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                {...register("isActive")}
              />
              <Label htmlFor="isActiveEmployee" className="text-xs text-slate-300 select-none cursor-pointer">
                Tài khoản nhân viên được phép hoạt động
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs h-10"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold text-xs h-10 rounded-xl px-6"
              >
                {isPending ? "Đang xử lý..." : editingProfile ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
