const express = require("express");
const router = express.Router();
const { update } = require("../controllers/admin.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

router.put("/:id", verifyToken, verifyRole("admin"), update);

module.exports = router;
