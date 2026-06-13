"use client";

import React, { useState, useTransition } from "react";
import { createAppointmentAction, updateAppointmentStatusAction, checkInAppointmentAction } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Appointment {
  id: string;
  patientId: string;
  branchId: string;
  doctorId: string | null;
  scheduledAt: any;
  durationMinutes: number;
  status: "BOOKED" | "CONFIRMED" | "ARRIVED" | "CANCELLED" | "NO_SHOW";
  reason: string;
  notes: string | null;
}

interface AppointmentRow {
  appointment: Appointment;
  patient: {
    id: string;
    fullName: string;
    patientCode: string;
    phone: string;
  };
  doctor: {
    id: string;
    fullName: string;
  } | null;
}

interface AppointmentsClientProps {
  initialAppointments: AppointmentRow[];
  patientsList: any[];
  doctorsList: any[];
  currentUserRole: string;
}

export function AppointmentsClient({
  initialAppointments,
  patientsList,
  doctorsList,
  currentUserRole,
}: AppointmentsClientProps) {
  const [appointmentsList, setAppointmentsList] = useState<AppointmentRow[]>(initialAppointments);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const openAddModal = () => {
    reset({
      patientId: patientsList[0]?.id || "",
      doctorId: doctorsList[0]?.id || "",
      scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      durationMinutes: 15,
      reason: "",
      notes: "",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const res = await createAppointmentAction(data);
      if (res.success) {
        toast.success("Đặt lịch hẹn thành công");
        setIsOpen(false);
        // Refresh local appointments list
        const patient = patientsList.find((p) => p.id === data.patientId);
        const doctor = doctorsList.find((d) => d.id === data.doctorId);
        const newRow: AppointmentRow = {
          appointment: res.data,
          patient: {
            id: patient.id,
            fullName: patient.fullName,
            patientCode: patient.patientCode,
            phone: patient.phone,
          },
          doctor: doctor
            ? {
                id: doctor.id,
                fullName: doctor.fullName,
              }
            : null,
        };
        setAppointmentsList((prev) => [newRow, ...prev]);
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const handleStatusChange = (apptId: string, status: any) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction(apptId, status);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái lịch hẹn sang: ${status}`);
        setAppointmentsList((prev) =>
          prev.map((row) =>
            row.appointment.id === apptId
              ? { ...row, appointment: { ...row.appointment, status: res.data.status } }
              : row
          )
        );
      } else {
        toast.error(res.error || "Không thể cập nhật trạng thái");
      }
    });
  };

  const handleCheckIn = (apptId: string) => {
    startTransition(async () => {
      const res = await checkInAppointmentAction(apptId);
      if (res.success) {
        toast.success("Bệnh nhân đã check-in thành công! Lượt khám đã được tạo và đưa vào hàng chờ.");
        setAppointmentsList((prev) =>
          prev.map((row) =>
            row.appointment.id === apptId
              ? { ...row, appointment: { ...row.appointment, status: "ARRIVED" } }
              : row
          )
        );
      } else {
        toast.error(res.error || "Không thể thực hiện check-in");
      }
    });
  };

  // Filters
  const filtered = appointmentsList.filter((row) => {
    const matchesSearch =
      row.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.patient.phone.includes(searchTerm) ||
      (row.doctor?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      row.appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || row.appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "BOOKED": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "CONFIRMED": return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "ARRIVED": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "CANCELLED": return "bg-slate-500/10 border-slate-500/20 text-slate-400";
      case "NO_SHOW": return "bg-red-500/10 border-red-500/20 text-red-400";
      default: return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BOOKED": return "Đã đặt";
      case "CONFIRMED": return "Xác nhận";
      case "ARRIVED": return "Đã đến";
      case "CANCELLED": return "Đã hủy";
      case "NO_SHOW": return "Không đến";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Quản lý Lịch hẹn</h2>
          <p className="text-sm text-slate-400">Xem, đặt lịch hẹn và thực hiện check-in tiếp đón</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-lg shadow-blue-500/10 self-start sm:self-auto"
        >
          Đặt lịch hẹn
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Input
          placeholder="Tìm theo bệnh nhân, bác sĩ, lý do..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl placeholder-slate-500 focus:ring-1 focus:ring-blue-500 max-w-sm"
        />

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value="BOOKED">Đã đặt (BOOKED)</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="ARRIVED">Đã đến / Check-in (ARRIVED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            <option value="NO_SHOW">Vắng mặt (NO_SHOW)</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/40">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 font-bold">Thời gian hẹn</TableHead>
              <TableHead className="text-slate-400 font-bold">Bệnh nhân</TableHead>
              <TableHead className="text-slate-400 font-bold">Điện thoại</TableHead>
              <TableHead className="text-slate-400 font-bold">Bác sĩ hẹn</TableHead>
              <TableHead className="text-slate-400 font-bold">Lý do khám</TableHead>
              <TableHead className="text-slate-400 font-bold text-center">Trạng thái</TableHead>
              <TableHead className="text-slate-400 font-bold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  Không tìm thấy lịch hẹn nào
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const dateObj = new Date(row.appointment.scheduledAt);
                const isArrived = row.appointment.status === "ARRIVED";
                const isCancelled = row.appointment.status === "CANCELLED";

                return (
                  <TableRow key={row.appointment.id} className="border-slate-800/60 hover:bg-slate-800/10 transition">
                    <TableCell className="text-white text-xs font-semibold">
                      {format(dateObj, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-400 text-xs">
                      {row.patient.fullName}
                      <span className="block text-[10px] text-slate-500 font-mono font-normal">
                        {row.patient.patientCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs">{row.patient.phone}</TableCell>
                    <TableCell className="text-slate-300 text-xs">
                      {row.doctor?.fullName || <span className="text-slate-500">Chưa xếp bác sĩ</span>}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs truncate max-w-xs" title={row.appointment.reason}>
                      {row.appointment.reason}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(row.appointment.status)}`}>
                        {getStatusLabel(row.appointment.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      {/* Check-in action (only for booked/confirmed status) */}
                      {!isArrived && !isCancelled && row.appointment.doctorId && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(row.appointment.id)}
                          disabled={isPending}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] h-7 px-2.5 font-bold shadow-md shadow-emerald-500/10"
                        >
                          Check-in
                        </Button>
                      )}

                      {/* Dropdown status update or simple toggles */}
                      {!isArrived && !isCancelled && (
                        <>
                          {row.appointment.status === "BOOKED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(row.appointment.id, "CONFIRMED")}
                              disabled={isPending}
                              className="text-purple-400 hover:text-white hover:bg-purple-600/10 rounded-lg text-[10px] h-7 px-2"
                            >
                              Xác nhận
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(row.appointment.id, "CANCELLED")}
                            disabled={isPending}
                            className="text-red-400 hover:text-white hover:bg-red-600/10 rounded-lg text-[10px] h-7 px-2"
                          >
                            Hủy hẹn
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Booking Form Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Đặt lịch hẹn khám</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Điền các thông tin để lên lịch hẹn khám cho bệnh nhân.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Select */}
            <div className="space-y-1">
              <Label htmlFor="patientId" className="text-xs font-semibold text-slate-300">
                Bệnh nhân đã đăng ký
              </Label>
              <select
                id="patientId"
                disabled={isPending}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-white px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
                {...register("patientId", { required: true })}
              >
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientCode}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Select */}
            <div className="space-y-1">
              <Label htmlFor="doctorId" className="text-xs font-semibold text-slate-300">
                Bác sĩ phụ trách
              </Label>
              <select
                id="doctorId"
                disabled={isPending}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-white px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
                {...register("doctorId")}
              >
                <option value="">-- Không xếp bác sĩ trước --</option>
                {doctorsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="scheduledAt" className="text-xs font-semibold text-slate-300">
                  Thời gian hẹn khám
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl focus:ring-1 focus:ring-blue-500 h-10"
                  {...register("scheduledAt", { required: "Vui lòng chọn thời gian" })}
                />
                {errors.scheduledAt && (
                  <span className="text-[10px] text-red-400">{errors.scheduledAt.message as string}</span>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="durationMinutes" className="text-xs font-semibold text-slate-300">
                  Thời lượng dự kiến
                </Label>
                <select
                  id="durationMinutes"
                  disabled={isPending}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-white px-3 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 cursor-pointer"
                  {...register("durationMinutes", { required: true })}
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reason" className="text-xs font-semibold text-slate-300">
                Lý do hẹn khám
              </Label>
              <Input
                id="reason"
                placeholder="Ví dụ: Tái khám định kỳ, khám răng..."
                disabled={isPending}
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("reason", { required: "Vui lòng nhập lý do" })}
              />
              {errors.reason && (
                <span className="text-[10px] text-red-400">{errors.reason.message as string}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-semibold text-slate-300">
                Ghi chú thêm (nếu có)
              </Label>
              <Input
                id="notes"
                placeholder="Ví dụ: Mang theo hồ sơ cũ..."
                disabled={isPending}
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl placeholder-slate-600 focus:ring-1 focus:ring-blue-500"
                {...register("notes")}
              />
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
                {isPending ? "Đang đặt..." : "Lên lịch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
