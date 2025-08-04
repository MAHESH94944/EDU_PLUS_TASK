const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");
const sequelize = require("../src/config/db");

async function seed() {
  const queryInterface = sequelize.getQueryInterface();

  // Hash passwords
  const hash = async (pwd) => await bcrypt.hash(pwd, 10);

  // 1. Admin user
  const adminUser = {
    name: "Administrator User Example Name",
    email: "admin@example.com",
    password: await hash("Admin@1234"),
    address: "123 Admin Street, City, Country",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 2. Test users
  const users = [
    {
      name: "Normal User Example Name 1",
      email: "user1@example.com",
      password: await hash("User1@1234"),
      address: "101 User Lane, City",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Normal User Example Name 2",
      email: "user2@example.com",
      password: await hash("User2@1234"),
      address: "102 User Lane, City",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Store Owner Example Name 1",
      email: "owner1@example.com",
      password: await hash("Owner1@1234"),
      address: "201 Owner Road, City",
      role: "owner",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Store Owner Example Name 2",
      email: "owner2@example.com",
      password: await hash("Owner2@1234"),
      address: "202 Owner Road, City",
      role: "owner",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Insert users
  const allUsers = [adminUser, ...users];
  await queryInterface.bulkInsert("users", allUsers);

  // Get inserted users (with ids)
  const [userRows] = await sequelize.query("SELECT * FROM users");

  const owner1 = userRows.find((u) => u.email === "owner1@example.com");
  const owner2 = userRows.find((u) => u.email === "owner2@example.com");

  // 3. Stores with different owners
  const stores = [
    {
      name: "Alpha Store",
      email: "alpha@store.com",
      address: "1 Alpha Street",
      ownerId: owner1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Beta Store",
      email: "beta@store.com",
      address: "2 Beta Avenue",
      ownerId: owner2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Gamma Store",
      email: "gamma@store.com",
      address: "3 Gamma Blvd",
      ownerId: owner1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await queryInterface.bulkInsert("stores", stores);

  // Get inserted stores (with ids)
  const [storeRows] = await sequelize.query("SELECT * FROM stores");

  // 4. Ratings
  const user1 = userRows.find((u) => u.email === "user1@example.com");
  const user2 = userRows.find((u) => u.email === "user2@example.com");
  const storeAlpha = storeRows.find((s) => s.name === "Alpha Store");
  const storeBeta = storeRows.find((s) => s.name === "Beta Store");
  const storeGamma = storeRows.find((s) => s.name === "Gamma Store");

  const ratings = [
    {
      userId: user1.id,
      storeId: storeAlpha.id,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: user2.id,
      storeId: storeAlpha.id,
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: user1.id,
      storeId: storeBeta.id,
      rating: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: user2.id,
      storeId: storeGamma.id,
      rating: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await queryInterface.bulkInsert("ratings", ratings);

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
