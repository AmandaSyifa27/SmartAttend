const prisma = require("../lib/prisma");
const crypto = require("crypto");

const getAll = async (req, res) => {
 try {
  const data = await prisma.mahasiswa.findMany({
   orderBy: { nama: "asc" },
   select: {
    id: true,
    nim: true,
    nama: true,
    prodi: true,
    kelas: true,
    angkatan: true,
    email: true,
    foto: true,
    createdAt: true,
    faceDescriptor: true,
    enrollToken: true,
    enrollTokenExp: true,
    enrollDone: true,
   },
  });

  const result = data.map((mhs) => ({
   ...mhs,
   isFaceEnrolled: mhs.faceDescriptor.length > 0,
   faceDescriptor: undefined,
  }));
  res.json(result);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const getById = async (req, res) => {
 const { id } = req.params;
 try {
  const data = await prisma.mahasiswa.findUnique({
   where: { id },
   select: {
    id: true,
    nim: true,
    nama: true,
    prodi: true,
    kelas: true,
    angkatan: true,
    email: true,
    foto: true,
    createdAt: true,
    faceDescriptor: false,
   },
  });
  if (!data)
   return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const create = async (req, res) => {
 const { nim, nama, prodi, kelas, angkatan, email } = req.body;
 try {
  // buat unique token
  const enrollToken = crypto.randomUUID();
  const enrollTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari exp

  const data = await prisma.mahasiswa.create({
   data: {
    nim,
    nama,
    prodi,
    kelas,
    angkatan: parseInt(angkatan),
    email,
    faceDescriptor: [],
    enrollToken,
    enrollTokenExp,
    enrollDone: false,
   },
  });
  res.status(201).json({ message: "Mahasiswa berhasil dibuat", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const update = async (req, res) => {
 const { id } = req.params;
 const { nim, nama, prodi, kelas, angkatan, email } = req.body;
 try {
  const data = await prisma.mahasiswa.update({
   where: { id },
   data: { nim, nama, prodi, kelas, angkatan: parseInt(angkatan), email },
  });
  res.json({ message: "Mahasiwa berhasil diupdate", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const remove = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.catatanHadir.deleteMany({
   where: { mahasiswaId: id },
  });

  const jadwalList = await prisma.jadwalMaster.findMany({
   where: { mahasiswaIds: { has: id } },
  });

  for (const jadwal of jadwalList) {
   await prisma.jadwalMaster.update({
    where: { id: jadwal.id },
    data: {
     mahasiswaIds: jadwal.mahasiswaIds.filter((mhsId) => mhsId !== id),
     mahasiswa: {
      disconnect: { id },
     },
    },
   });
  }

  await prisma.mahasiswa.delete({ where: { id } });
  res.json({ message: "Mahasiswa berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// const remove = async (req, res) => {
//  const { id } = req.params;
//  try {
//   await prisma.mahasiswa.delete({ where: { id } });
//   res.json({ message: "Mahasiswa berhasil dihapus" });
//  } catch (err) {
//   res.status(500).json({ message: "Server error", error: err.message });
//  }
// };

const enrollFace = async (req, res) => {
 const { id } = req.params;
 const { faceDescriptor } = req.body;
 try {
  if (!faceDescriptor || faceDescriptor.length !== 128) {
   return res.status(400).json({ message: "Face descriptor tidak valid" });
  }

  const data = await prisma.mahasiswa.update({
   where: { id },
   data: { faceDescriptor },
  });

  res.json({
   message: "Face enrollment berhasil",
   data: { id: data.id, nama: data.nama },
  });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const resetToken = async (req, res) => {
 const { id } = req.params;
 try {
  const enrollToken = crypto.randomUUID();
  const enrollTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const data = await prisma.mahasiswa.update({
   where: { id },
   data: {
    enrollToken,
    enrollTokenExp,
    enrollDone: false,
    faceDescriptor: [],
   },
  });
  res.json({ message: "Token berhasil direset", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const getByToken = async (req, res) => {
 const { token } = req.params;
 try {
  const mahasiswa = await prisma.mahasiswa.findUnique({
   where: { enrollToken: token },
   select: {
    id: true,
    nim: true,
    nama: true,
    prodi: true,
    kelas: true,
    enrollTokenExp: true,
    enrollDone: true,
   },
  });

  if (!mahasiswa) {
   return res.status(404).json({ message: "Token tidak valid" });
  }

  if (mahasiswa.enrollDone) {
   return res
    .status(400)
    .json({ message: "Wajah sudah pernah didaftarkan menggunkan link ini" });
  }

  if (new Date() > new Date(mahasiswa.enrollTokenExp)) {
   return res.status(400).json({
    message: "Link sudah kdaluarsa. Hubungi admin untuk mendapatkan link baru.",
   });
  }

  res.json(mahasiswa);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// ------Self-enrollment-----------
const selfEnrollFace = async (req, res) => {
 const { token } = req.params;
 const { faceDescriptor } = req.body;
 try {
  if (!faceDescriptor || faceDescriptor.length !== 128) {
   return res.status(400).json({ message: "Face descriptor tidak valid" });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
   where: { enrollToken: token },
  });

  if (!mahasiswa) {
   return res.status(404).json({ message: "Link tidak valid" });
  }

  if (mahasiswa.enrollDone) {
   return res.status(400).json({ message: "Wajah sudah pernah didaftarkan" });
  }

  if (new Date() > new Date(mahasiswa.enrollTokenExp)) {
   return res.status(400).json({
    message:
     "Link sudah kadaluarsa. Hubungi admin untuk mendapatkan link baru.",
   });
  }

  await prisma.mahasiswa.update({
   where: { enrollToken: token },
   data: {
    faceDescriptor,
    enrollDone: true,
   },
  });

  res.json({ message: "Wajah berhasil didaftarkan." });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};
module.exports = {
 getAll,
 getById,
 create,
 update,
 remove,
 enrollFace,
 resetToken,
 getByToken,
 selfEnrollFace,
};
