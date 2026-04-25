const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

const seed = async () => {
 try {
  // Seed Admin
  const hashedPassword = await bcrypt.hash("admin4545", 10);

  const existingAdmin = await prisma.admin.findUnique({
   where: { email: "admin@smartattend.com" },
  });

  if (existingAdmin) {
   console.log("Admin sudah ada, skip.");
  } else {
   const admin = await prisma.admin.create({
    data: {
     email: "admin@smartattend.com",
     password: hashedPassword,
     nama: "Admin SmartAttend",
    },
   });

   console.log(`Admin berhasil dibuat: ${admin.email}`);
   console.log(`Email: ${admin.email}`);
   console.log("Password: admin4545");
  }

  // Seed Tahun Ajaran default jika belum ada
  const existingTA = await prisma.tahunAjaran.findFirst({
   where: { isAktif: true },
  });

  if (existingTA) {
   console.log("Tahun Ajaran aktif sudah ada, skip.");
  } else {
   const ta = await prisma.tahunAjaran.create({
    data: {
     nama: "2024/2025 Ganjil",
     isAktif: true,
    },
   });
   console.log(`Tahun Ajaran aktif berhasil dibuat: ${ta.nama}`);
  }
 } catch (err) {
  console.log("Seeder Error:", err.message);
 } finally {
  await prisma.$disconnect();
 }
};

seed();
