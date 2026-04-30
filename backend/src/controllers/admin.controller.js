const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const update = async (req, res) => {
 const { id } = req.params;
 const { nama, email, password } = req.body;
 try {
  let data = { nama, email };
  if (password) {
   data.password = await bcrypt.hash(password, 10);
  }
  const updated = await prisma.admin.update({
   where: { id },
   data,
   select: { id: true, nama: true, email: true },
  });
  res.json({ message: "Profil berhasil diupdate", data: updated });
 } catch (err) {
  res.status(500).json({ message: "Server error", error: err.message });
 }
};

module.exports = { update };
