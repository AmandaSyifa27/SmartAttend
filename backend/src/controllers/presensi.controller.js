const prisma = require("../lib/prisma");

const bukaSesi = async (req, res) => {
 const { jadwalId, pertemuanKe, tipeKelas } = req.body;
 try {
  const jumlahPertemuan = await prisma.sesiPertemuan.count({
   where: { jadwalId, statusSesi: "SELESAI" },
  });

  if (jumlahPertemuan >= 14) {
   return res.status(400).json({
    message: "Pertemuan sudah mencapai batas maksimal 14 kali",
   });
  }

  const existing = await prisma.sesiPertemuan.findUnique({
   where: { jadwalId_pertemuanKe: { jadwalId, pertemuanKe } },
  });
  if (existing) {
   return res.status(400).json({
    message: `Pertemuan ke-${pertemuanKe} sudah pernah diadakan`,
   });
  }
  const sesi = await prisma.sesiPertemuan.create({
   data: {
    jadwalId,
    pertemuanKe,
    tipeKelas,
    statusSesi: "BERLANGSUNG",
    waktuBuka: new Date(),
   },
   include: {
    jadwal: {
     include: {
      mahasiswa: {
       select: { id: true, nim: true, nama: true, faceDescriptor: true },
      },
      mataKuliah: { select: { nama: true, kode: true } },
     },
    },
   },
  });
  res.status(201).json({ message: "Sesi berhasil dibuka", data: sesi });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const getPertemuanByJadwal = async (req, res) => {
 const { jadwalId } = req.params;
 try {
  const data = await prisma.sesiPertemuan.findMany({
   where: { jadwalId },
   orderBy: { pertemuanKe: "asc" },
   select: {
    pertemuanKe: true,
    statusSesi: true,
    tipeKelas: true,
    waktuBuka: true,
   },
  });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const submitBatch = async (req, res) => {
 const { sesiId } = req.params;
 const { kehadiran } = req.body;
 try {
  const sesi = await prisma.sesiPertemuan.findUnique({ where: { id: sesiId } });
  if (!sesi) return res.status(404).json({ message: "Sesi tidak ditemukan" });
  if (sesi.statusSesi === "SELESAI") {
   return res
    .status(400)
    .json({ message: "Sesi sudah selesai, tidak bisa submit ulang" });
  }
  const catatanHadir = await prisma.catatanHadir.createMany({
   data: kehadiran.map((item) => ({
    sesiId,
    mahasiswaId: item.mahasiswaId,
    status: item.status,
    waktuAbsen: new Date(),
   })),
  });
  await prisma.sesiPertemuan.update({
   where: { id: sesiId },
   data: { statusSesi: "SELESAI", waktuTutup: new Date() },
  });
  res.json({
   message: "Kehadiran berhasil disimpan",
   total: catatanHadir.count,
  });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// Hapus sesi yang masih BERLANGSUNG (belum dikonfirmasi)
const hapusSesiBerlangsung = async (req, res) => {
 const { sesiId } = req.params;
 try {
  const sesi = await prisma.sesiPertemuan.findUnique({ where: { id: sesiId } });
  if (!sesi) return res.status(404).json({ message: "Sesi tidak ditemukan" });
  if (sesi.statusSesi === "SELESAI") {
   return res
    .status(400)
    .json({ message: "Sesi sudah selesai, tidak bisa dihapus" });
  }
  await prisma.sesiPertemuan.delete({ where: { id: sesiId } });
  res.json({ message: "Sesi berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const getRekap = async (req, res) => {
 const { jadwalId } = req.params;
 try {
  const sesiList = await prisma.sesiPertemuan.findMany({
   where: { jadwalId, statusSesi: "SELESAI", catatanHadir: { some: {} } },
   orderBy: { pertemuanKe: "asc" },
   include: {
    catatanHadir: {
     include: {
      mahasiswa: { select: { id: true, nim: true, nama: true } },
     },
    },
   },
  });
  res.json(sesiList);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// Admin update status kehadiran satu mahasiswa
const updateKehadiran = async (req, res) => {
 const { catatanId } = req.params;
 const { status } = req.body;
 try {
  const data = await prisma.catatanHadir.update({
   where: { id: catatanId },
   data: { status },
  });
  res.json({ message: "Kehadiran berhasil diubah", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// Rekap untuk admin (semua jadwal)
const getRekapAdmin = async (req, res) => {
 const { jadwalId } = req.params;
 try {
  const sesiList = await prisma.sesiPertemuan.findMany({
   where: { jadwalId, statusSesi: "SELESAI", catatanHadir: { some: {} } },
   orderBy: { pertemuanKe: "asc" },
   include: {
    catatanHadir: {
     include: {
      mahasiswa: { select: { id: true, nim: true, nama: true } },
     },
    },
   },
  });
  res.json(sesiList);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// admin hapus sesi
const hapusSesiAdmin = async (req, res) => {
 const { sesiId } = req.params;
 try {
  // Hapus catatan hadir dulu kalau ada
  await prisma.catatanHadir.deleteMany({ where: { sesiId } });
  await prisma.sesiPertemuan.delete({ where: { id: sesiId } });
  res.json({ message: "Sesi berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = {
 bukaSesi,
 getPertemuanByJadwal,
 submitBatch,
 hapusSesiBerlangsung,
 getRekap,
 updateKehadiran,
 getRekapAdmin,
 hapusSesiAdmin,
};
