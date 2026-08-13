const express = require("express");
const router = express.Router();
const {
 getAll,
 getById,
 create,
 update,
 remove,
 enrollFace,
 resetToken,
 getByToken,
 selfEnrollFace,
} = require("../controllers/mhs.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

router.get("/enroll/:token", getByToken);
router.post("/enroll/:token", selfEnrollFace);

router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, verifyRole("admin"), create);
router.put("/:id", verifyToken, verifyRole("admin"), update);
router.delete("/:id", verifyToken, verifyRole("admin"), remove);
router.post("/:id/enroll-face", verifyToken, verifyRole("admin"), enrollFace);
router.patch("/:id/reset-token", verifyToken, verifyRole("admin"), resetToken);

module.exports = router;
