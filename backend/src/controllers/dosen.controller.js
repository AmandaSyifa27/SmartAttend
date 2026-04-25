const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const getAll = async (req, res) => {
 try {
  const data = await prisma.dosen.findMany({
   orderBy: { nama: "asc" },
   select: {
    id: true,
    nidn: true,
    nama: true,
    email: true,
    foto: true,
   },
  });
  res.json(data);
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const create = async (req, res) => {
 const { nidn, nama, email, password } = req.body;
 try {
  const hashedPassword = await bcrypt.hash(password, 10);
  const data = await prisma.dosen.create({
   data: { nidn, nama, email, password: hashedPassword },
  });
  res.status(201).json({ message: "Dosen berhasil dibuat", data });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const update = async (req, res) => {
 const { id } = req.params;
 const { nidn, nama, email, password } = req.body;
 try {
  let data = { nidn, nama, email };

  if (password) {
   data.password = await bcrypt.hash(password, 10);
  }

  const updated = await prisma.dosen.update({
   where: { id },
   data,
  });
  res.json({ message: "Dosen berhasil diupdate", data: updated });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

const remove = async (req, res) => {
 const { id } = req.params;
 try {
  await prisma.dosen.delete({ where: { id } });
  res.json({ message: "Dosen berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = { getAll, create, update, remove };
