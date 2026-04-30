// const express = require("express");
// const router = express.Router();
// const {
//  getAll,
//  create,
//  setAktif,
//  update,
//  remove,
// } = require("../controllers/tahunAjaran.controller");
// const { verifyToken } = require("../middlewares/auth.middleware");
// const { verifyRole } = require("../middlewares/role.middleware");

// router.get("/", verifyToken, getAll);
// router.post("/", verifyToken, verifyRole("admin"), create);
// router.patch("/:id/aktif", verifyToken, verifyRole("admin"), setAktif);
// router.put("/:id", verifyToken, verifyRole("admin"), update);
// router.delete("/:id", verifyToken, verifyRole("admin", remove));

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
 getAll,
 create,
 setAktif,
 update,
 remove,
} = require("../controllers/tahunAjaran.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/role.middleware");

router.get("/", verifyToken, getAll);
router.post("/", verifyToken, verifyRole("admin"), create);
router.patch("/:id/aktif", verifyToken, verifyRole("admin"), setAktif);
router.put("/:id", verifyToken, verifyRole("admin"), update);
router.delete("/:id", verifyToken, verifyRole("admin"), remove);

module.exports = router;
