const controller = require("../controllers/media.controller");

const { verifyToken, isAdmin } = require("../middleware/authJwt");

const express = require("express");

const router = express.Router();

// 1. READ ALL (Public Access)
router.get("/", controller.findAll);

// 2. READ ONE (Public Access)
router.get("/:id_media", controller.findOne);

// --- Rute yang dilindungi (Admin Only) ---
// Middleware: verifyToken dulu, baru cek isAdmin
router.post("/", [verifyToken, isAdmin], controller.create);
router.put("/:id_media", [verifyToken, isAdmin], controller.update);
router.delete("/:id_media", [verifyToken, isAdmin], controller.delete);

module.exports = router;
