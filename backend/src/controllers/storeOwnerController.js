const Store = require("../models/Store");
const Rating = require("../models/Rating");
const User = require("../models/User");
const { Op } = require("sequelize");

// 1. Get list of users who rated the owner's store(s)
const getStoreRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    // Find all stores owned by this owner
    const stores = await Store.findAll({ where: { ownerId } });
    if (!stores.length) {
      return res
        .status(404)
        .json({ message: "No stores found for this owner." });
    }
    const storeIds = stores.map((store) => store.id);

    // Find all ratings for these stores, include user info
    const ratings = await Rating.findAll({
      where: { storeId: { [Op.in]: storeIds } },
      include: [
        { model: User, attributes: ["id", "name", "email", "address"] },
      ],
    });

    const result = ratings.map((rating) => ({
      userId: rating.userId,
      userName: rating.User ? rating.User.name : null,
      userEmail: rating.User ? rating.User.email : null,
      userAddress: rating.User ? rating.User.address : null,
      storeId: rating.storeId,
      rating: rating.rating,
      createdAt: rating.createdAt,
    }));

    return res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch ratings.", error: err.message });
  }
};

// 2. Get average rating and stats for the owner's store(s)
const getStoreStats = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const stores = await Store.findAll({ where: { ownerId } });
    if (!stores.length) {
      return res
        .status(404)
        .json({ message: "No stores found for this owner." });
    }
    const storeIds = stores.map((store) => store.id);

    // Get average rating and total ratings for each store
    const stats = await Promise.all(
      stores.map(async (store) => {
        const result = await Rating.findOne({
          attributes: [
            [
              Rating.sequelize.fn("AVG", Rating.sequelize.col("rating")),
              "avgRating",
            ],
            [
              Rating.sequelize.fn("COUNT", Rating.sequelize.col("id")),
              "totalRatings",
            ],
          ],
          where: { storeId: store.id },
        });
        return {
          storeId: store.id,
          storeName: store.name,
          avgRating: result.dataValues.avgRating
            ? Number(result.dataValues.avgRating).toFixed(2)
            : null,
          totalRatings: result.dataValues.totalRatings || 0,
        };
      })
    );

    return res.json(stats);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch store stats.", error: err.message });
  }
};

module.exports = {
  getStoreRatings,
  getStoreStats,
};
