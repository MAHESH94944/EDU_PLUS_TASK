const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/auth");
const storeOwnerController = require("../controllers/storeOwnerController");

// GET /api/store-owner/ratings - get ratings for owner's store(s)
router.get(
  "/ratings",
  verifyToken,
  checkRole("owner"),
  storeOwnerController.getStoreRatings
);

// GET /api/store-owner/stats - get stats for owner's store(s)
router.get(
  "/stats",
  verifyToken,
  checkRole("owner"),
  storeOwnerController.getStoreStats
);
module.exports = router;
