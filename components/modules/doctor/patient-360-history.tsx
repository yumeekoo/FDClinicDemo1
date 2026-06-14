"use client";

import React, { useEffect, useState } from "react";
import { getPatient360Action } from "@/actions/doctor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Patient360HistoryProps {
  patientId: string;
}

export function Patient360History({ patientId }: Patient360HistoryProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getPatient360Action(patientId);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải hồ sơ bệnh sử");
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gray-50 rounded-xl" />
        <div className="h-40 bg-gray-50 rounded-xl" />
        <div className="h-40 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-rose-900 bg-rose-950/10 rounded-xl text-rose-400 text-sm">
        Gặp lỗi khi tải lịch sử bệnh lý: {error}
      </div>
    );
  }

  const { patient, history } = data;

  return (
    <div className="space-y-6 text-left">
      {/* Patient Summary Card */}
      <Card className="border-gray-200 bg-gray-50/40 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
            <span>Thông tin hành chính bệnh nhân</span>
            <Badge className="bg-blue-600 text-white font-mono text-xs">{patient.patientCode}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="text-gray-500 block text-xs">Họ và tên</span>
            <strong className="text-gray-900 text-base">{patient.fullName}</strong>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Ngày sinh</span>
            <span>{new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Giới tính</span>
            <span>{patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Số điện thoại</span>
            <span>{patient.phone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block text-xs">Địa chỉ thường trú</span>
            <span>{patient.address}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">CCCD</span>
            <span>{patient.cccd || "Chưa có"}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Mã thẻ BHYT</span>
            <span>{patient.bhytCode || "Chưa có"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-700">Lịch sử các lượt khám ({history.length})</h3>

        {history.length === 0 ? (
          <Card className="border-dashed border-gray-200 bg-transparent text-center p-12 text-gray-500 text-sm">
            Bệnh nhân chưa có lịch sử khám bệnh nào hoàn thành trước đây.
          </Card>
        ) : (
          <div className="space-y-6 relative border-l border-gray-200 pl-6 ml-3">
            {history.map((record: any) => {
              const { visit, diagnoses: diagList, prescriptions: prescItems, clsOrders: clsList } = record;

              return (
                <div key={visit.id} className="relative group">
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-125 transition" />
                  </span>

                  <Card className="border-gray-200 bg-gray-50/10 hover:bg-gray-50/25 transition duration-150">
                    <CardHeader className="py-3 px-4 border-b border-gray-200 bg-gray-50/20 flex flex-row justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 block">
                          {new Date(visit.createdAt).toLocaleString("vi-VN")}
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          Mã lượt khám: {visit.visitCode}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Bác sĩ khám</span>
                        <span className="text-xs font-bold text-gray-900">BS. {visit.doctorName || "Không rõ"}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-sm text-gray-600">
                      {/* Clinical Complaint */}
                      <div>
                        <span className="text-gray-500 text-xs block">Triệu chứng/Bệnh sử</span>
                        <p className="mt-0.5 text-gray-700">{visit.chiefComplaint}</p>
                      </div>

                      {/* Diagnoses */}
                      {diagList && diagList.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs block">Chẩn đoán xác định</span>
                          <div className="mt-1 space-y-1">
                            {diagList.map((d: any) => (
                              <div key={d.id} className="flex items-start gap-2">
                                <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[10px] py-0 px-1.5 mt-0.5">
                                  {d.icd10Code}
                                </Badge>
                                <span>{d.icd10Description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {prescItems && prescItems.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs block mb-1">Toa thuốc đã kê</span>
                          <div className="bg-gray-50/50 rounded-lg border border-gray-200 p-3 space-y-2">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="text-gray-500 border-b border-gray-200 pb-1">
                                  <th className="pb-1 font-semibold">Tên thuốc</th>
                                  <th className="pb-1 font-semibold">Liều dùng</th>
                                  <th className="pb-1 font-semibold text-center">Số lượng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prescItems.map((item: any) => (
                                  <tr key={item.id} className="border-b border-slate-900/50 last:border-0">
                                    <td className="py-1.5 font-semibold text-gray-700">{item.drugName}</td>
                                    <td className="py-1.5 text-gray-500">
                                      {item.dosage} — {item.frequency} ({item.durationDays} ngày)
                                      {item.instructions && <span className="block text-[10px] text-gray-500 italic">{item.instructions}</span>}
                                    </td>
                                    <td className="py-1.5 text-center text-gray-700 font-mono">
                                      {item.quantity} {item.unit}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* CLS Orders */}
                      {clsList && clsList.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs block mb-1">Chỉ định cận lâm sàng</span>
                          <div className="flex flex-wrap gap-2">
                            {clsList.map((c: any) => (
                              <Badge
                                key={c.id}
                                className={`text-[10px] font-semibold ${
                                  c.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : c.status === "CANCELLED"
                                    ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                }`}
                              >
                                {c.serviceName} ({c.status === "COMPLETED" ? "Đã trả kết quả" : "Chờ kết quả"})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
