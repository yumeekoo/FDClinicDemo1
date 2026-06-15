import "./polyfill";

import { db } from "./index";
import { branches, profiles, inventoryItems } from "./schema";
import { supabaseAdmin } from "../lib/supabase/admin";
import { eq } from "drizzle-orm";
import { fakerVI as faker } from "@faker-js/faker";
import { patients, patientBranchLinks, visits } from "./schema";

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu (Seeding)...");

  // 1. Tạo các chi nhánh
  let branchHNId = "";
  let branchHCMId = "";

  const existingBranches = await db.select().from(branches);
  const hnBranch = existingBranches.find(b => b.code === "CN_HANOI");
  const hcmBranch = existingBranches.find(b => b.code === "CN_HCM");

  if (!hnBranch) {
    const [inserted] = await db.insert(branches).values({
      name: "Phòng khám Đa khoa Clinic-Hub - Chi nhánh Hà Nội",
      address: "123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội",
      phone: "024.3333.8888",
      code: "CN_HANOI",
      isActive: true,
    }).returning();
    branchHNId = inserted.id;
    console.log(`✅ Đã tạo chi nhánh Hà Nội: ${branchHNId}`);
  } else {
    branchHNId = hnBranch.id;
    console.log(`ℹ️ Chi nhánh Hà Nội đã tồn tại: ${branchHNId}`);
  }

  if (!hcmBranch) {
    const [inserted] = await db.insert(branches).values({
      name: "Phòng khám Đa khoa Clinic-Hub - Chi nhánh TP. HCM",
      address: "456 Đường Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
      phone: "028.7777.9999",
      code: "CN_HCM",
      isActive: true,
    }).returning();
    branchHCMId = inserted.id;
    console.log(`✅ Đã tạo chi nhánh TP. HCM: ${branchHCMId}`);
  } else {
    branchHCMId = hcmBranch.id;
    console.log(`ℹ️ Chi nhánh TP. HCM đã tồn tại: ${branchHCMId}`);
  }

  // 2. Tạo tài khoản nhân sự
  const usersToCreate = [
    {
      email: "admin@clinichub.vn",
      fullName: "Super Admin Tổng",
      phone: "0901111222",
      role: "ADMIN" as const,
      employeeCode: "SA_01",
      branchId: branchHNId,
    },
    {
      email: "branch_admin@clinichub.vn",
      fullName: "Quản Trị Chi Nhánh Hà Nội",
      phone: "0902222333",
      role: "BRANCH_ADMIN" as const,
      employeeCode: "BA_HN_01",
      branchId: branchHNId,
    },
    {
      email: "receptionist@clinichub.vn",
      fullName: "Lễ Tân Hà Nội",
      phone: "0903333444",
      role: "RECEPTION" as const,
      employeeCode: "LT_HN_01",
      branchId: branchHNId,
    },
    {
      email: "doctor@clinichub.vn",
      fullName: "Bác Sĩ Lâm Sàng",
      phone: "0904444555",
      role: "DOCTOR" as const,
      employeeCode: "BS_HN_01",
      branchId: branchHNId,
    },
    {
      email: "technician@clinichub.vn",
      fullName: "Kỹ Thuật Viên CLS Hà Nội",
      phone: "0905555666",
      role: "PARACLINICAL" as const,
      employeeCode: "KT_HN_01",
      branchId: branchHNId,
    },
    {
      email: "cashier@clinichub.vn",
      fullName: "Thu Ngân Hà Nội",
      phone: "0906666777",
      role: "CASHIER" as const,
      employeeCode: "TN_HN_01",
      branchId: branchHNId,
    },
    {
      email: "pharmacist@clinichub.vn",
      fullName: "Dược Sĩ Hà Nội",
      phone: "0907777888",
      role: "PHARMACIST" as const,
      employeeCode: "DS_HN_01",
      branchId: branchHNId,
    },
  ];

  // Lấy danh sách users từ Supabase Auth
  const { data: { users: authUsersList }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("❌ Lỗi khi lấy danh sách auth users:", listError.message);
    process.exit(1);
  }

  for (const u of usersToCreate) {
    let authUserId = "";
    const existingAuthUser = authUsersList.find(au => au.email === u.email);

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.log(`ℹ️ Auth User đã tồn tại: ${u.email} (${authUserId})`);
      
      // Đảm bảo user_metadata có branch_id và role chính xác
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: { role: u.role, branch_id: u.branchId }
      });
    } else {
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: "Password123!",
        email_confirm: true,
        user_metadata: { role: u.role, branch_id: u.branchId },
      });

      if (createError) {
        console.error(`❌ Không thể tạo Auth User cho ${u.email}:`, createError.message);
        continue;
      }
      authUserId = createdUser.user.id;
      console.log(`✅ Đã tạo Auth User thành công cho ${u.email}: ${authUserId}`);
    }

    // Kiểm tra profiles
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, authUserId)).limit(1);
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: authUserId,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        branchId: u.branchId,
        employeeCode: u.employeeCode,
        isActive: true,
      });
      console.log(`✅ Đã tạo hồ sơ nhân viên profiles: ${u.fullName} (${u.employeeCode})`);
    } else {
      // Cập nhật profile nếu đã tồn tại để đảm bảo đồng bộ
      await db.update(profiles).set({
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        branchId: u.branchId,
        employeeCode: u.employeeCode,
        updatedAt: new Date(),
      }).where(eq(profiles.id, authUserId));
      console.log(`ℹ️ Đã cập nhật hồ sơ nhân viên profiles: ${u.fullName} (${u.employeeCode})`);
    }
  }

  // 3. Tạo kho thuốc mẫu (Có các lô khác nhau để kiểm thử thuật toán FEFO)
  const mockInventory = [
    // Gastropulgite
    { drugName: "Gastropulgite (Trị đau dạ dày)", drugCode: "GAS100", unit: "Gói", qty: "20.00", batch: "LOT-2026A", expiryOffsetDays: 15 }, // Hết hạn sớm nhất
    { drugName: "Gastropulgite (Trị đau dạ dày)", drugCode: "GAS100", unit: "Gói", qty: "100.00", batch: "LOT-2026B", expiryOffsetDays: 180 },
    { drugName: "Gastropulgite (Trị đau dạ dày)", drugCode: "GAS100", unit: "Gói", qty: "500.00", batch: "LOT-2027A", expiryOffsetDays: 500 },

    // Panadol Extra
    { drugName: "Panadol Extra 500mg", drugCode: "PARA500", unit: "Viên", qty: "150.00", batch: "LOT-P01", expiryOffsetDays: 30 },
    { drugName: "Panadol Extra 500mg", drugCode: "PARA500", unit: "Viên", qty: "800.00", batch: "LOT-P02", expiryOffsetDays: 365 },

    // Kháng sinh Amoxicillin
    { drugName: "Amoxicillin 500mg", drugCode: "AMOX500", unit: "Viên", qty: "50.00", batch: "LOT-A01", expiryOffsetDays: 45 },
    { drugName: "Amoxicillin 500mg", drugCode: "AMOX500", unit: "Viên", qty: "300.00", batch: "LOT-A02", expiryOffsetDays: 400 },

    // Giảm đau kháng viêm Ibuprofen
    { drugName: "Ibuprofen 400mg", drugCode: "IBU400", unit: "Viên", qty: "200.00", batch: "LOT-I01", expiryOffsetDays: 60 },
  ];

  // Xóa kho cũ để tránh trùng lặp khi chạy seed lại nhiều lần
  await db.delete(inventoryItems).where(eq(inventoryItems.branchId, branchHNId));
  console.log("🧹 Đã làm sạch kho chi nhánh Hà Nội trước khi nạp thuốc.");

  for (const item of mockInventory) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + item.expiryOffsetDays);

    await db.insert(inventoryItems).values({
      branchId: branchHNId,
      drugName: item.drugName,
      drugCode: item.drugCode,
      unit: item.unit,
      quantityInStock: item.qty,
      minStockThreshold: "20.00",
      expiryDate: expDate.toISOString().slice(0, 10),
      batchNumber: item.batch,
    });
  }
  console.log("✅ Đã nạp thành công kho thuốc chi nhánh Hà Nội phục vụ cho quy trình FEFO.");

  // 4. Sinh dữ liệu 60 bệnh nhân và Lượt khám
  console.log("🧬 Bắt đầu sinh 60 bệnh nhân và lịch sử khám...");
  
  // Lấy ID thật của Bác sĩ và Lễ tân HN/HCM
  const bsHN = authUsersList.find(u => u.email === "doctor@clinichub.vn")?.id;
  const ltHN = authUsersList.find(u => u.email === "receptionist@clinichub.vn")?.id;
  
  // Xóa cũ để seed lại an toàn
  await db.delete(visits).where(eq(visits.branchId, branchHNId));
  await db.delete(patientBranchLinks).where(eq(patientBranchLinks.branchId, branchHNId));
  await db.delete(patients).where(eq(patients.primaryBranchId, branchHNId));

  for (let i = 0; i < 60; i++) {
    const branchId = i < 30 ? branchHNId : branchHCMId;
    const dId = bsHN;
    const rId = ltHN;
    
    if(!dId || !rId) continue;

    const phone = '09' + faker.string.numeric(8);
    const pCode = `BN-${Date.now()}-${i}`;
    
    const [patient] = await db.insert(patients).values({
      patientCode: pCode,
      fullName: faker.person.fullName(),
      dateOfBirth: faker.date.birthdate({ min: 5, max: 80, mode: 'age' }),
      gender: faker.helpers.arrayElement(["MALE", "FEMALE"]),
      phone: phone,
      cccd: faker.string.numeric(12),
      address: faker.location.streetAddress(),
      primaryBranchId: branchId,
    }).returning();
    
    await db.insert(patientBranchLinks).values({
      patientId: patient.id,
      branchId: branchId,
      visitCount: 1,
      isPrimary: true,
    });
    
    const statuses = ["WAITING", "IN_PROGRESS", "CLS_PENDING", "COMPLETED", "PAID"];
    await db.insert(visits).values({
      visitCode: `KH-${Date.now()}-${i}`,
      patientId: patient.id,
      branchId: branchId,
      doctorId: dId,
      receptionistId: rId,
      status: faker.helpers.arrayElement(statuses) as any,
      chiefComplaint: faker.lorem.sentence(),
      medicalHistory: faker.lorem.sentence(),
    });
  }
  console.log("✅ Đã sinh xong 60 bệnh nhân và lượt khám ngẫu nhiên.");

  console.log("🎉 Hoàn tất quá trình nạp dữ liệu mẫu (Seeding)!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Lỗi trong quá trình nạp dữ liệu:", err);
  process.exit(1);
});
