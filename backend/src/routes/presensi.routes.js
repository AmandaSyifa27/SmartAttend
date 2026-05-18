const express = require("express");
const router = express.Router();
const {
 bukaSesi,
 getPertemuanByJadwal,
 submitBatch,
 hapusSesiBerlangsung,
 getRekap,
 updateKehadiran,
 getRekapAdmin,
 hapusSesiAdmin,
 getSesiBerlangsung,
} = require("../controllers/presensi.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

// router.post("/sesi", verifyToken, verifyRole("dosen"), bukaSesi);
router.get("/sesi/:jadwalId/pertemuan", verifyToken, getPertemuanByJadwal);
router.get("/sesi/:jadwalId/berlangsung", verifyToken, getSesiBerlangsung);
// router.post(
//  "/sesi/:sesiId/submit",
//  verifyToken,
//  verifyRole("dosen"),
//  submitBatch,
// );
router.post("/submit", verifyToken, verifyRole("dosen"), submitBatch);
router.delete(
 "/sesi/:sesiId",
 verifyToken,
 verifyRole("dosen"),
 hapusSesiBerlangsung,
);
router.get("/rekap/:jadwalId", verifyToken, getRekap);
router.patch(
 "/catatan/:catatanId",
 verifyToken,
 verifyRole("admin"),
 updateKehadiran,
);
router.get(
 "/admin/rekap/:jadwalId",
 verifyToken,
 verifyRole("admin"),
 getRekapAdmin,
);
router.delete(
 "/admin/sesi/:sesiId",
 verifyToken,
 verifyRole("admin"),
 hapusSesiAdmin,
);

module.exports = router;
