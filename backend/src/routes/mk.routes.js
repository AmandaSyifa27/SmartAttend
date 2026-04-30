const express = require("express");
const router = express.Router();
const {
 getAll,
 create,
 update,
 remove,
} = require("../controllers/mk.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

router.get("/", verifyToken, getAll);
router.post("/", verifyToken, verifyRole("admin"), create);
router.put("/:id", verifyToken, verifyRole("admin"), update);
router.delete("/:id", verifyToken, verifyRole("admin"), remove);

module.exports = router;
