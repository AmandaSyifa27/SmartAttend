const prisma = require("../lib/prisma");

const getAll = async (req, res) => {
 try {
  const data = await prisma.mataKuliah.findMany({
   orderBy: { nama: "asc" },
  });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const create = async (req, res) => {
 const { kode, nama, sks } = req.body;
 try {
  const data = await prisma.mataKuliah.create({
   data: { kode, nama, sks: parseInt(sks) },
  });
  res.status(201).json({ message: "Mata kuliah berhasil dibuat", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const update = async (req, res) => {
 const { id } = req.params;
 const { kode, nama, sks } = req.body;
 try {
  const data = await prisma.mataKuliah.update({
   where: { id },
   data: { kode, nama, sks: parseInt(sks) },
  });
  res.json({ message: "Mata Kuliah berhasil diupdate", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const remove = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.mataKuliah.delete({ where: { id } });
  res.json({ message: "Mata kuliah berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = { getAll, create, update, remove };
