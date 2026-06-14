"use client";

import React, { useState } from "react";
import { searchPatientsAction, linkPatientToBranchAction } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBranch } from "@/hooks/use-branch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/forms/patient-form";
import { VisitForm } from "@/components/forms/visit-form";

export function MpiSearch() {
  const { activeBranchId } = useBranch();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // Selected patient for visit registration
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<any>(null);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast.warning("Vui lòng nhập số điện thoại hoặc số CCCD");
      return;
    }

    setLoading(true);
    try {
      const res = await searchPatientsAction(query);
      if (res.success) {
        setPatients(res.data);
        setSearched(true);
      } else {
        toast.error(res.error || "Lỗi khi tìm kiếm");
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkBranch = async (patientId: string) => {
    try {
      const res = await linkPatientToBranchAction(patientId);
      if (res.success) {
        toast.success("Đã liên kết bệnh nhân thành công vào chi nhánh này");
        // Re-run search to update status
        handleSearch();
      } else {
        toast.error(res.error || "Không thể liên kết chi nhánh");
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 bg-gray-50/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Tìm kiếm bệnh nhân (MPI)</CardTitle>
          <CardDescription className="text-gray-500">
            Tra cứu thông tin bệnh nhân trên toàn bộ hệ thống bằng số điện thoại hoặc căn cước công dân (CCCD).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Nhập số điện thoại hoặc CCCD..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-gray-50 border-gray-200 text-gray-900 placeholder-slate-500 focus-visible:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Kết quả tìm kiếm ({patients.length})</h3>
            
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 text-gray-900 shadow h-9 px-4 cursor-pointer">
                Thêm bệnh nhân mới
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-gray-50 border-gray-200 text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Đăng ký bệnh nhân mới</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Nhập thông tin cá nhân của bệnh nhân để đăng ký vào hệ thống MPI.
                  </DialogDescription>
                </DialogHeader>
                <PatientForm onSuccess={() => {
                  toast.success("Tạo bệnh nhân thành công");
                  handleSearch();
                }} />
              </DialogContent>
            </Dialog>
          </div>

          {patients.length === 0 ? (
            <Card className="border-dashed border-gray-200 bg-transparent text-center p-8">
              <p className="text-gray-500">Không tìm thấy bệnh nhân nào khớp với từ khóa của bạn.</p>
              <p className="text-sm text-gray-500 mt-1">Vui lòng đăng ký bệnh nhân mới nếu đây là lần đầu khám.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((p) => {
                const isLinkedToCurrent = p.branchLinks?.some(
                  (link: any) => link.branchId === activeBranchId
                );

                return (
                  <Card
                    key={p.id}
                    className="border-gray-200 bg-gray-50/20 hover:bg-gray-50/40 transition duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {p.fullName}
                            {isLinkedToCurrent ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Đã liên kết
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Khác chi nhánh
                              </Badge>
                            )}
                          </CardTitle>
                          <span className="text-xs text-gray-500 font-mono mt-1 block">
                            Mã BN: {p.patientCode}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 block">Ngày sinh</span>
                          <span>{new Date(p.dateOfBirth).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Giới tính</span>
                          <span>
                            {p.gender === "MALE"
                              ? "Nam"
                              : p.gender === "FEMALE"
                              ? "Nữ"
                              : "Khác"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Số điện thoại</span>
                          <span>{p.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">CCCD</span>
                          <span>{p.cccd || "Không có"}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-gray-500 block">Địa chỉ</span>
                        <span className="line-clamp-1">{p.address}</span>
                      </div>

                      {p.allergies && p.allergies.length > 0 && (
                        <div className="text-xs">
                          <span className="text-gray-500 block">Dị ứng</span>
                          <span className="text-rose-400">{p.allergies.join(", ")}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
                        {isLinkedToCurrent ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
                            onClick={() => {
                              setSelectedPatientForVisit(p);
                              setIsVisitOpen(true);
                            }}
                          >
                            Đăng ký khám
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white hover:bg-gray-50 text-gray-700"
                            onClick={() => handleLinkBranch(p.id)}
                          >
                            Liên kết chi nhánh này
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dialog for Visit Registration */}
      <Dialog open={isVisitOpen} onOpenChange={setIsVisitOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-50 border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Đăng ký lượt khám</DialogTitle>
            <DialogDescription className="text-gray-500">
              Đăng ký lượt khám mới cho bệnh nhân: <strong className="text-gray-900">{selectedPatientForVisit?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>
          {selectedPatientForVisit && (
            <VisitForm
              patientId={selectedPatientForVisit.id}
              onSuccess={() => {
                setIsVisitOpen(false);
                toast.success("Đăng ký khám thành công!");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
