"use client";

import React, { useState, useEffect } from "react";
import { getBranchInventoryAction } from "@/actions/doctor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PrescriptionItemInput } from "@/lib/validations/doctor";

interface PrescriptionFormProps {
  onAdd: (item: PrescriptionItemInput) => void;
  addedItems: PrescriptionItemInput[];
}

export function PrescriptionForm({ onAdd, addedItems }: PrescriptionFormProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector states
  const [selectedDrugId, setSelectedDrugId] = useState("");
  const [dosage, setDosage] = useState("500mg");
  const [frequency, setFrequency] = useState("2 lần / ngày");
  const [durationDays, setDurationDays] = useState(5);
  const [quantity, setQuantity] = useState(10);
  const [instructions, setInstructions] = useState("Uống sau ăn sáng, tối");

  // Selected drug details
  const selectedDrug = inventory.find((item) => item.id === selectedDrugId);

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await getBranchInventoryAction();
        if (res.success) {
          setInventory(res.data);
        } else {
          toast.error(res.error || "Không thể tải danh sách kho thuốc");
        }
      } catch (err) {
        toast.error("Lỗi khi tải kho thuốc");
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrugId) {
      toast.warning("Vui lòng chọn thuốc từ kho");
      return;
    }

    if (!selectedDrug) return;

    if (quantity <= 0) {
      toast.warning("Số lượng kê thuốc phải lớn hơn 0");
      return;
    }

    // Check availability
    const available = selectedDrug.quantityInStock;
    
    // Check if already added in prescription, subtract that from available
    const alreadyAddedQty = addedItems
      .filter((i) => i.drugId === selectedDrugId)
      .reduce((sum, current) => sum + current.quantity, 0);

    const remainingAvailable = available - alreadyAddedQty;

    if (quantity > remainingAvailable) {
      toast.error(
        `Số lượng kê (${quantity}) vượt quá tồn kho khả dụng (${remainingAvailable} ${selectedDrug.unit})`
      );
      return;
    }

    const item: PrescriptionItemInput = {
      drugId: selectedDrug.id,
      drugName: selectedDrug.drugName,
      drugCode: selectedDrug.drugCode,
      dosage,
      frequency,
      durationDays,
      quantity,
      unit: selectedDrug.unit,
      instructions: instructions || undefined,
    };

    onAdd(item);
    toast.success(`Đã thêm thuốc vào toa: ${selectedDrug.drugName}`);

    // Reset selector states
    setSelectedDrugId("");
    setInstructions("Uống sau ăn sáng, tối");
  };

  return (
    <form onSubmit={handleAdd} className="space-y-4 text-left p-4 rounded-xl border border-slate-800 bg-slate-950/20">
      <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wider">Thêm thuốc vào toa</h4>
      
      {/* Select Drug */}
      <div className="space-y-1.5">
        <Label className="text-slate-300">Chọn thuốc có trong kho <span className="text-rose-500">*</span></Label>
        {loading ? (
          <div className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 animate-pulse flex items-center px-3 text-sm text-slate-500">
            Đang tải kho thuốc chi nhánh...
          </div>
        ) : inventory.length === 0 ? (
          <div className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 flex items-center px-3 text-sm text-amber-500">
            Kho thuốc trống hoặc hết hàng. Vui lòng nạp kho thuốc mẫu!
          </div>
        ) : (
          <Select
            value={selectedDrugId}
            onValueChange={(val) => setSelectedDrugId(val || "")}
          >
            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Chọn thuốc..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[250px]">
              {inventory.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.drugName} (Tồn: {item.quantityInStock} {item.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedDrug && (
        <div className="text-xs text-blue-400 bg-blue-500/5 p-2 rounded border border-blue-500/10 grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-500">Mã thuốc: </span>
            <span className="font-mono font-bold">{selectedDrug.drugCode}</span>
          </div>
          <div>
            <span className="text-slate-500">Tồn kho khả dụng: </span>
            <span className="font-bold">{selectedDrug.quantityInStock} {selectedDrug.unit}</span>
          </div>
          <div>
            <span className="text-slate-500">Hạn sử dụng: </span>
            <span>{new Date(selectedDrug.expiryDate).toLocaleDateString("vi-VN")}</span>
          </div>
          <div>
            <span className="text-slate-500">Lô sản xuất: </span>
            <span className="font-mono">{selectedDrug.batchNumber}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dosage */}
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="dosage" className="text-slate-300">Liều dùng</Label>
          <Input
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="bg-slate-950 border-slate-850 text-white"
          />
        </div>

        {/* Frequency */}
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="frequency" className="text-slate-300">Tần suất</Label>
          <Input
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="bg-slate-950 border-slate-850 text-white"
          />
        </div>

        {/* Duration Days */}
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="durationDays" className="text-slate-300">Số ngày dùng</Label>
          <Input
            id="durationDays"
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
            className="bg-slate-950 border-slate-850 text-white"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="quantity" className="text-slate-300">Tổng số lượng</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="bg-slate-950 border-slate-850 text-white"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-1.5">
        <Label htmlFor="instructions" className="text-slate-300">Cách sử dụng / Hướng dẫn uống</Label>
        <Input
          id="instructions"
          placeholder="Ví dụ: Uống sau ăn sáng, tối 30 phút..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="bg-slate-950 border-slate-850 text-white"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={loading || !selectedDrugId}
          className="bg-sky-650 hover:bg-sky-550 text-white px-5 font-semibold text-xs"
        >
          Thêm vào toa thuốc
        </Button>
      </div>
    </form>
  );
}
