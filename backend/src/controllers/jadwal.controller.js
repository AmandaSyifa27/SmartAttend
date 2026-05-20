const prisma = require("../lib/prisma");

const getAll = async (req, res) => {
 try {
  const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
   where: { isAktif: true },
  });

  if (!tahunAjaranAktif) {
   return res
    .status(400)
    .json({ message: "Tidak ada Tahun Ajaran yang aktif" });
  }

  const data = await prisma.jadwalMaster.findMany({
   where: { tahunAjaranId: tahunAjaranAktif.id },
   orderBy: { hari: "asc" },
   include: {
    dosen: {
     select: { id: true, nama: true, nidn: true },
    },
    mataKuliah: {
     select: { id: true, nama: true, kode: true, sks: true },
    },
    tahunAjaran: {
     select: { id: true, nama: true },
    },
    _count: {
     select: { mahasiswa: true },
    },
   },
  });

  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const getById = async (req, res) => {
 const { id } = req.params;
 try {
  const data = await prisma.jadwalMaster.findUnique({
   where: { id },
   include: {
    dosen: { select: { id: true, nama: true, nidn: true } },
    mataKuliah: { select: { id: true, nama: true, kode: true } },
    tahunAjaran: { select: { id: true, nama: true } },
    mahasiswa: {
     select: {
      id: true,
      nim: true,
      nama: true,
      kelas: true,
      faceDescriptor: true,
     },
    },
    sesiPertemuan: { orderBy: { pertemuanKe: "asc" } },
   },
  });
  if (!data) return res.status(404).json({ message: "Jadwal tidak ditemukan" });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const create = async (req, res) => {
 const { hari, jamMulai, jamSelesai, kelas, ruangan, dosenId, mataKuliahId } =
  req.body;
 try {
  const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
   where: { isAktif: true },
  });

  if (!tahunAjaranAktif) {
   return res
    .status(400)
    .json({ message: " Tidak ada Tahun Ajaran yang aktif" });
  }

  const data = await prisma.jadwalMaster.create({
   data: {
    hari,
    jamMulai,
    jamSelesai,
    kelas,
    ruangan,
    dosenId,
    mataKuliahId,
    tahunAjaranId: tahunAjaranAktif.id,
    mahasiswaIds: [],
   },
  });

  res.status(201).json({ message: "Jadwal berhasil dibuat", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const update = async (req, res) => {
 const { id } = req.params;
 const { hari, jamMulai, jamSelesai, kelas, ruangan, dosenId, mataKuliahId } =
  req.body;
 try {
  const data = await prisma.jadwalMaster.update({
   where: { id },
   data: { hari, jamMulai, jamSelesai, kelas, ruangan, dosenId, mataKuliahId },
  });
  res.json({ message: "Jadwal berhasil diupdate", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const remove = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.jadwalMaster.delete({ where: { id } });
  res.json({ message: "Jadwal berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const updatePeserta = async (req, res) => {
 const { id } = req.params;
 const { mahasiswaIds } = req.body;
 try {
  const data = await prisma.jadwalMaster.update({
   where: { id },
   data: {
    mahasiswaIds,
    mahasiswa: {
     set: mahasiswaIds.map((mhsId) => ({ id: mhsId })),
    },
   },
  });
  res.json({ message: "Peserta berhasil diupdate", data });
 } catch (err) {
  res.status(500).json({ message: "server error", error: err.message });
 }
};

const getJadwalDosen = async (req, res) => {
 const dosenId = req.user.id;
 try {
  const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
   where: { isAktif: true },
  });

  if (!tahunAjaranAktif) {
   return res
    .status(400)
    .json({ message: "Tidak ada Tahun Ajaran yang aktif" });
  }

  const data = await prisma.jadwalMaster.findMany({
   where: {
    dosenId,
    tahunAjaranId: tahunAjaranAktif.id,
   },
   include: {
    mataKuliah: { select: { id: true, nama: true, kode: true } },
    _count: { select: { mahasiswa: true } },
    sesiPertemuan: {
     orderBy: { pertemuanKe: "desc" },
     take: 1,
    },
   },
  });
  res.json(data);
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
 updatePeserta,
 getJadwalDosen,
};
