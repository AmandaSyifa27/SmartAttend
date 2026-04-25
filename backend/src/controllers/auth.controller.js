const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const login = async (req, res) => {
 // const { email, password, role } = req.body; // SALAH: nidn tidak ter-destructure, menyebabkan login dosen selalu gagal
 const { email, nidn, password, role } = req.body;

 try {
  let user = null;

  // user bedasarkan role
  if (role === "admin") {
   user = await prisma.admin.findUnique({ where: { email } });
  } else if (role === "dosen") {
   user = await prisma.dosen.findUnique({ where: { nidn } });
  } else {
   return res.status(400).json({ message: "Email tidak ditemukan" });
  }

  // kalo user tdk ditemukan
  if (!user) {
   return res.status(404).json({ message: "Email tidak ditemukan" });
  }

  // cek password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
   return res.status(401).json({ message: "Password salah" });
  }

  // buat token jwt
  const token = jwt.sign(
   { id: user.id, nama: user.nama, role },
   process.env.JWT_SECRET,
   { expiresIn: "8h" },
  );

  res.json({
   message: "Login berhasil",
   token,
   user: { id: user.id, nama: user.nama, email: user.email, role },
  });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = { login };
