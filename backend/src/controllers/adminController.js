const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");
const { Op } = require("sequelize");
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
} = require("../utils/response");

// Helper: Check admin
function isAdmin(req) {
  return req.user && req.user.role === "admin";
}

// 1. Admin creates a new user (all roles)
const createUser = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  const { name, email, password, address, role } = req.body;
  if (!name || name.length < 20 || name.length > 60) {
    return validationErrorResponse(res, [
      "Name must be between 20 and 60 characters.",
    ]);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return validationErrorResponse(res, ["Invalid email address."]);
  }
  if (
    !password ||
    password.length < 8 ||
    password.length > 16 ||
    !/[A-Z]/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return validationErrorResponse(res, [
      "Password must be 8-16 chars, include uppercase and special char.",
    ]);
  }
  if (!address || address.length > 400) {
    return validationErrorResponse(res, [
      "Address must be at most 400 characters.",
    ]);
  }
  if (!["admin", "user", "owner"].includes(role)) {
    return validationErrorResponse(res, ["Invalid role."]);
  }
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return errorResponse(res, "Email already registered.", 409);
    await User.create({ name, email, password, address, role });
    return successResponse(res, {}, "User created.", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create user.", 500, err.message);
  }
};

// 2. Get paginated/filterable list of users
const getAllUsers = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  const { page = 1, limit = 10, name, email, role } = req.query;
  const where = {};
  if (name) where.name = { [Op.like]: `%${name}%` };
  if (email) where.email = { [Op.like]: `%${email}%` };
  if (role) where.role = role;
  try {
    const users = await User.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      total: users.count,
      page: parseInt(page),
      users: users.rows,
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch users.", 500, err.message);
  }
};

// 3. Get details for a specific user
const getUserDetails = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return errorResponse(res, "User not found.", 404);
    let userData = user.toJSON();
    if (user.role === "owner") {
      // Get average rating for owner's stores
      const stores = await Store.findAll({ where: { ownerId: user.id } });
      const storeIds = stores.map((s) => s.id);
      if (storeIds.length) {
        const avg = await Rating.findOne({
          attributes: [
            [
              Rating.sequelize.fn("AVG", Rating.sequelize.col("rating")),
              "avgRating",
            ],
          ],
          where: { storeId: { [Op.in]: storeIds } },
        });
        userData.rating = avg.dataValues.avgRating || null;
      } else {
        userData.rating = null;
      }
    }
    return res.json(userData);
  } catch (err) {
    return errorResponse(res, "Failed to fetch user details.", 500, err.message);
  }
};

// 4. Admin creates a new store
const createStore = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  const { name, email, address, ownerId } = req.body;
  if (!name || name.length < 1 || name.length > 100) {
    return validationErrorResponse(res, ["Store name required (max 100 chars)."]);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return validationErrorResponse(res, ["Invalid store email."]);
  }
  if (!address || address.length > 400) {
    return validationErrorResponse(res, [
      "Address must be at most 400 characters.",
    ]);
  }
  if (!ownerId) {
    return validationErrorResponse(res, ["OwnerId required."]);
  }
  try {
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== "owner") {
      return validationErrorResponse(res, [
        "OwnerId must be a valid owner user.",
      ]);
    }
    await Store.create({ name, email, address, ownerId });
    return successResponse(res, {}, "Store created.", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create store.", 500, err.message);
  }
};

// 5. Get paginated/filterable list of stores
const getAllStores = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  const { page = 1, limit = 10, name, email, address } = req.query;
  const where = {};
  if (name) where.name = { [Op.like]: `%${name}%` };
  if (email) where.email = { [Op.like]: `%${email}%` };
  if (address) where.address = { [Op.like]: `%${address}%` };
  try {
    const stores = await Store.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      total: stores.count,
      page: parseInt(page),
      stores: stores.rows,
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch stores.", 500, err.message);
  }
};

// 6. Get dashboard stats (counts)
const getDashboardStats = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
  try {
    const usersCount = await User.count();
    const storesCount = await Store.count();
    const ratingsCount = await Rating.count();
    return res.json({
      users: usersCount,
      stores: storesCount,
      ratings: ratingsCount,
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch dashboard stats.", 500, err.message);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserDetails,
  createStore,
  getAllStores,
  getDashboardStats,
};
 