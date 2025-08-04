const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");

// 1. User hasMany Stores (as owner)
User.hasMany(Store, {
  foreignKey: "ownerId",
  as: "stores",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 2. Store belongsTo User (as owner)
Store.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 3. User hasMany Ratings
User.hasMany(Rating, {
  foreignKey: "userId",
  as: "ratings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 4. Store hasMany Ratings
Store.hasMany(Rating, {
  foreignKey: "storeId",
  as: "ratings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 5. Rating belongsTo User
Rating.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// 6. Rating belongsTo Store
Rating.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = {
  User,
  Store,
  Rating,
};
