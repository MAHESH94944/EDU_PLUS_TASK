const Store = require("../models/Store");
const Rating = require("../models/Rating");
const { Op } = require("sequelize");

// 1. Get list of stores with user's rating if exists
const getStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const stores = await Store.findAll();
    const ratings = await Rating.findAll({ where: { userId } });
    const ratingsMap = {};
    ratings.forEach((r) => {
      ratingsMap[r.storeId] = r.rating;
    });

    const storesWithUserRating = await Promise.all(
      stores.map(async (store) => {
        // Calculate overall rating
        const avg = await Rating.findOne({
          attributes: [
            [
              Rating.sequelize.fn("AVG", Rating.sequelize.col("rating")),
              "avgRating",
            ],
          ],
          where: { storeId: store.id },
        });
        return {
          id: store.id,
          name: store.name,
          address: store.address,
          overallRating:
            avg && avg.dataValues.avgRating
              ? Number(avg.dataValues.avgRating).toFixed(2)
              : null,
          userRating: ratingsMap[store.id] || null,
        };
      })
    );
    return res.json(storesWithUserRating);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch stores.", error: err.message });
  }
};

// 2. Submit or update rating for a store
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;
    if (!storeId || !rating) {
      return res
        .status(400)
        .json({ message: "storeId and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }
    // Upsert rating
    const [userRating, created] = await Rating.upsert(
      { userId, storeId, rating },
      { returning: true }
    );
    return res.json({
      message: created ? "Rating submitted." : "Rating updated.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to submit rating.", error: err.message });
  }
};

// 3. Search stores by name or address
const searchStores = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required." });
    }
    const stores = await Store.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { address: { [Op.like]: `%${q}%` } },
        ],
      },
    });
    return res.json(stores);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to search stores.", error: err.message });
  }
};

module.exports = {
  getStores,
  submitRating,
  searchStores,
};
