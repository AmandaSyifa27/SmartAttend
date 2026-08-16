const crypto = require("crypto");
const prisma = require("./prisma");

const migrate = async () => {
 const mahasiswaList = await prisma.mahasiswa.findMany({
  where: {
   enrollToken: null,
  },
 });

 console.log(`Ditemukan ${mahasiswaList.length} mahasiswa tanpa token`);

 for (const mhs of mahasiswaList) {
  await prisma.mahasiswa.update({
   where: { id: mhs.id },
   data: {
    enrollToken: crypto.randomUUID(),
    enrollTokenExp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    enrollDone: mhs.faceDescriptor.length > 0,
   },
  });
  console.log(`✅ ${mhs.nama} — token generated`);
 }

 console.log("Migrasi selesai!");
 await prisma.$disconnect();
};

migrate();
