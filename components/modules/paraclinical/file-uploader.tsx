"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Image as ImageIcon, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  orderId: string;
  visitId: string;
  fileUrls: string[];
  onChange: (urls: string[]) => void;
}

export function FileUploader({ orderId, visitId, fileUrls, onChange }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const supabase = createClient();

    const newUrls = [...fileUrls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Generate clean filename
      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${visitId}/${orderId}/${cleanFileName}`;

      try {
        // Upload to bucket 'cls-results'
        const { data, error } = await supabase.storage
          .from("cls-results")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Storage upload error details:", error);
          // Check if bucket doesn't exist
          if (error.message.includes("Bucket not found") || (error as any).status === 404) {
            toast.error(
              `Thất bại: Bucket 'cls-results' chưa được tạo trên Supabase. Tôi đã mở chức năng nhập URL thủ công bên dưới.`
            );
            setShowManualUrl(true);
          } else {
            toast.error(`Lỗi tải lên file "${file.name}": ${error.message}`);
          }
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("cls-results")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          newUrls.push(urlData.publicUrl);
          toast.success(`Tải lên thành công: ${file.name}`);
        }
      } catch (err: any) {
        toast.error(`Lỗi hệ thống khi tải lên: ${err.message}`);
      }
    }

    onChange(newUrls);
    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updated = fileUrls.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    toast.info("Đã xóa file đính kèm");
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    if (!manualUrlInput.startsWith("http://") && !manualUrlInput.startsWith("https://")) {
      toast.warning("URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    onChange([...fileUrls, manualUrlInput.trim()]);
    setManualUrlInput("");
    toast.success("Đã thêm liên kết thủ công!");
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)/i) != null;
  };

  return (
    <div className="space-y-4 text-left">
      <Label className="text-slate-300 font-bold block">Tệp đính kèm kết quả (Hình ảnh, siêu âm, PDF)</Label>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-blue-500 bg-slate-950 hover:bg-slate-900/40 p-6 rounded-lg text-center cursor-pointer transition"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto text-slate-500 mb-2 group-hover:text-blue-400" />
        <p className="text-sm font-semibold text-slate-200">
          Kéo thả file vào đây hoặc nhấp để chọn file
        </p>
        <p className="text-[10px] text-slate-550 mt-1">
          Hỗ trợ ảnh chụp X-quang, MRI, siêu âm, kết quả xét nghiệm PDF (tối đa 10MB)
        </p>

        {uploading && (
          <div className="mt-3 text-xs text-blue-400 animate-pulse font-medium">
            Đang tải tệp tin lên Supabase Storage...
          </div>
        )}
      </div>

      {/* Fallback button & Manual URL panel */}
      <div className="flex justify-between items-center text-xs">
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-slate-500 hover:text-slate-300 underline flex items-center gap-1.5"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          {showManualUrl ? "Ẩn nhập liên kết thủ công" : "Nhập liên kết tệp thủ công (nếu lỗi)"}
        </button>
      </div>

      {showManualUrl && (
        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>NHẬP ĐƯỜNG DẪN KẾT QUẢ THỦ CÔNG</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập https://example.com/result.pdf..."
              value={manualUrlInput}
              onChange={(e) => setManualUrlInput(e.target.value)}
              className="bg-slate-950 border-slate-850 text-xs text-white"
            />
            <Button
              type="button"
              size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs whitespace-nowrap"
              onClick={handleAddManualUrl}
            >
              Thêm Link
            </Button>
          </div>
          <p className="text-[9px] text-slate-500">
            Sử dụng khi chưa cấu hình Supabase Storage Bucket hoặc muốn chèn link tài liệu bên ngoài.
          </p>
        </div>
      )}

      {/* Uploaded Files List */}
      {fileUrls.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-bold block">Danh sách tệp đính kèm ({fileUrls.length}):</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fileUrls.map((url, index) => {
              const fileName = url.substring(url.lastIndexOf("/") + 1);
              const isImg = isImage(url);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-850/60 relative overflow-hidden group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    {isImg ? (
                      <div className="h-10 w-10 rounded bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                        <img src={url} alt="Result thumbnail" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-200 hover:text-blue-400 truncate block hover:underline"
                      >
                        {fileName.length > 25 ? fileName.slice(0, 25) + "..." : fileName}
                      </a>
                      <span className="text-[9px] text-slate-500 block">Tệp đính kèm #{index + 1}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="h-7 w-7 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition ml-2 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
