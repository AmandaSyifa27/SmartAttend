const prisma = require("../lib/prisma");

const getAll = async (req, res) => {
 try {
  const data = await prisma.tahunAjaran.findMany({
   orderBy: { nama: "asc" },
  });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// POST TA baru
const create = async (req, res) => {
 const { nama } = req.body;
 try {
  const data = await prisma.tahunAjaran.create({
   data: { nama, isAktif: false },
  });
  res.status(201).json({ message: "Tahun ajaran berhasil dibuat", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// PATCH TA aktif
const setAktif = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.tahunAjaran.updateMany({
   data: { isAktif: false },
  });

  const data = await prisma.tahunAjaran.update({
   where: { id },
   data: { isAktif: true },
  });
  res.json({ message: "Tahun ajaran berhasil diaktifkan", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// PUT update TA
const update = async (req, res) => {
 const { id } = req.params;
 const { nama } = req.body;
 try {
  const data = await prisma.tahunAjaran.update({
   where: { id },
   data: { nama },
  });
  res.json({ message: "Tahun ajaran berhasil diupdate", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

// DELETE TA
const remove = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.tahunAjaran.delete({ where: { id } });
  res.json({ message: "Tahun ajaran berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = { getAll, create, setAktif, update, remove };
