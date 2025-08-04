const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const userController = require("../controllers/userController");

// GET /api/user/stores - get all stores with user's rating
router.get("/stores", verifyToken, userController.getStores);

// POST /api/user/stores/:id/rate - submit/update rating for a store
router.post("/stores/:id/rate", verifyToken, async (req, res) => {
  // Attach storeId from params to body for controller compatibility
  req.body.storeId = req.params.id;
  return userController.submitRating(req, res);
});

// GET /api/user/stores/search?q= - search stores by name or address
router.get("/stores/search", verifyToken, userController.searchStores);

module.exports = router;
