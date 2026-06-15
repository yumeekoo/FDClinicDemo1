const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'db/seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

if (!content.includes('@faker-js/faker')) {
  content = content.replace('import { eq } from "drizzle-orm";', 'import { eq } from "drizzle-orm";\\nimport { fakerVI as faker } from "@faker-js/faker";\\nimport { patients, patientBranchLinks, visits } from "./schema";');
}

const seedLogic = \`
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
    // Giả định dùng chung BS và LT HN cho test nhanh nếu HCM chưa có account tương ứng
    const dId = bsHN;
    const rId = ltHN;
    
    if(!dId || !rId) continue;

    const phone = faker.phone.number('09########');
    const pCode = \`BN-\${Date.now()}-\${i}\`;
    
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
      visitCode: \`KH-\${Date.now()}-\${i}\`,
      patientId: patient.id,
      branchId: branchId,
      doctorId: dId,
      receptionistId: rId,
      status: faker.helpers.arrayElement(statuses),
      chiefComplaint: faker.lorem.sentence(),
      medicalHistory: faker.lorem.sentence(),
    });
  }
  console.log("✅ Đã sinh xong 60 bệnh nhân và lượt khám ngẫu nhiên.");
\`;

if (!content.includes('Bắt đầu sinh 60 bệnh nhân')) {
  content = content.replace('console.log("🎉 Hoàn tất quá trình nạp dữ liệu mẫu (Seeding)!");', seedLogic + '\\n  console.log("🎉 Hoàn tất quá trình nạp dữ liệu mẫu (Seeding)!");');
  fs.writeFileSync(seedPath, content);
}
