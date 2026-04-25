const express = require("express");
const router = express.Router();
const {
 getAll,
 getById,
 create,
 update,
 remove,
 enrollFace,
} = require("../controllers/mhs.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyRole } = require("../middleware/role.middleware");

router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, verifyRole("admin"), create);
router.put("/:id", verifyToken, verifyRole("admin"), update);
router.delete("/:id", verifyToken, verifyRole("admin"), remove);
router.post("/:id/enroll-face", verifyToken, verifyRole("admin"), enrollFace);

module.exports = router;
