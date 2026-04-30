const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
 const authHeader = req.headers["authorization"];
 const token = authHeader && authHeader.split(" ")[1];

 if (!token) {
  return res.status(401).json({ message: "Token tidak ditemukan" });
 }

 try {
  // const decoded = jwt.verifyToken(token, process.env.JWT_SECRET); // SALAH: method verifyToken tidak ada di library jsonwebtoken
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
 } catch (err) {
  return res.status(203).json({ message: "Token tidak valid" });
 }
};

module.exports = { verifyToken };
