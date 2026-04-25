const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const tahunAjaranRoutes = require("./routes/tahunAjaran.routes");
const mataKuliahRoutes = require("./routes/mk.routes");
const dosenRoutes = require("./routes/dosen.routes");
const mahasiswaRoutes = require("./routes/mhs.routes");
const jadwalRoutes = require("./routes/jadwal.routes");
const presensiRoutes = require("./routes/presensi.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/mata-kuliah", mataKuliahRoutes);
app.use("/api/dosen", dosenRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/presensi", presensiRoutes);

// tes route
app.get("/", (req, res) => {
 res.json({ message: "SmartAttend API is running" });
});

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
