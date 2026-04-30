const prisma = require("../lib/prisma");

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
  const data = await prisma.mahasiswa.create({
   data: {
    nim,
    nama,
    prodi,
    kelas,
    angkatan: parseInt(angkatan),
    email,
    faceDescriptor: [],
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
  await prisma.mahasiswa.delete({ where: { id } });
  res.json({ message: "Mahasiswa berhasil dihapus" });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

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

module.exports = { getAll, getById, create, update, remove, enrollFace };
