const express = require("express");
const router = express.Router();
const {
 getAll,
 getById,
 create,
 update,
 remove,
 updatePeserta,
 getJadwalDosen,
} = require("../controllers/jadwal.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyRole } = require("../middleware/role.middleware");

router.get("/", verifyToken, getAll);
router.get("/dosen/saya", verifyToken, verifyRole("dosen"), getJadwalDosen);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, verifyRole("admin", create));
router.put("/:id", verifyToken, verifyRole("admin", update));
router.delete("/:id", verifyToken, verifyRole("admin", remove));
router.patch("/:id/peserta", verifyToken, verifyRole("admin", updatePeserta));

module.exports = router;
