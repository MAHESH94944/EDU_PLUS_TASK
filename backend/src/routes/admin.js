const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// All routes below are protected and admin-only
router.post(
  "/users",
  verifyToken,
  checkRole("admin"),
  adminController.createUser
);
router.get(
  "/users",
  verifyToken,
  checkRole("admin"),
  adminController.getAllUsers
);
router.get(
  "/users/:id",
  verifyToken,
  checkRole("admin"),
  adminController.getUserDetails
);

router.post(
  "/stores",
  verifyToken,
  checkRole("admin"),
  adminController.createStore
);
router.get(
  "/stores",
  verifyToken,
  checkRole("admin"),
  adminController.getAllStores
);

router.get(
  "/dashboard",
  verifyToken,
  checkRole("admin"),
  adminController.getDashboardStats
);

module.exports = router;
