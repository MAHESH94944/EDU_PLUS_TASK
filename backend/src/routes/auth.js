const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  register,
  login,
  updatePassword,
  logout,
} = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// PUT /api/auth/password (protected)
router.put("/password", verifyToken, updatePassword);

// POST /api/auth/logout
router.post("/logout", verifyToken, logout);

module.exports = router;
