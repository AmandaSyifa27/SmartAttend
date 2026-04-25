const express = require("express");
const router = express.Router();
const {
 bukaSesi,
 getPertemuanByJadwal,
 submitBatch,
 getRekap,
} = require("../controllers/presensi.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyRole } = require("../middleware/role.middleware");

router.post("/sesi", verifyToken, verifyRole("dosen"), bukaSesi);
router.get("/sesi/:jadwalId/pertemuan", verifyToken, getPertemuanByJadwal);
router.post(
 "/sesi/:sesiId/submit",
 verifyToken,
 verifyRole("dosen"),
 submitBatch,
);
router.get("/rekap/:jadwalId", verifyToken, getRekap);

module.exports = router;
