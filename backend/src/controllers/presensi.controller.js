const prisma = require("../lib/prisma");

const bukaSesi = async (req, res) => {
 const { jadwalId, pertemuanKe, tipeKelas } = req.body;
 try {
  const existing = await prisma.sesiPertemuan.findUnique({
   where: { jadwalId_pertemuanKe: { jadwalId } },
  });

  if (existing) {
   return res.status(400).json({
    message: "Pertemuan ke-${pertemuanKe} sudah pernah diadakan",
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
       select: {
        id: true,
        nim: true,
        nama: true,
        faceDescriptor: true,
       },
      },
      mataKuliah: { select: { nama: true, kode: true } },
     },
    },
   },
  });
  res.status(201).json({ message: "Sesi berhasil dibuka", data: sesi });
 } catch (err) {
  res.status(500).json({ message: "Server error" });
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
  const sesi = await prisma.sesiPertemuan.findUnique({
   where: { id: sesiId },
  });

  if (!sesi) {
   return res.status(404).json({ message: "Sesi tidak ditemukan" });
  }

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
   data: {
    statusSesi: "SELESAI",
    waktuTutup: new Date(),
   },
  });

  res.json({
   message: "Kehadiran berhsil disimpan",
   total: catatanHadir.count,
  });
 } catch (err) {
  res.status(500).json({ message: "Server error", errolr: err.message });
 }
};

const getRekap = async (req, res) => {
 const { jadwalId } = req.params;
 try {
  const sesiList = await prisma.sesiPertemuan.findMany({
   where: { jadwalId, statusSesi: "SELESAI" },
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

module.exports = { bukaSesi, getPertemuanByJadwal, submitBatch, getRekap };
