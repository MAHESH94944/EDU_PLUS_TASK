const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
} = require("../utils/response");

const register = async (req, res) => {
  try {
    let { name, email, password, address, role } = req.body;

    // Default role to "user" if not provided
    if (!role) role = "user";

    // Field validations
    if (!name || name.length < 20 || name.length > 60) {
      return validationErrorResponse(res, [
        "Name must be between 20 and 60 characters.",
      ]);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (
      !password ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8-16 chars, include uppercase and special char.",
      });
    }
    if (!address || address.length > 400) {
      return res
        .status(400)
        .json({ message: "Address must be at most 400 characters." });
    }
    if (!["admin", "user", "owner", "store_owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // Check for existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, "Email already registered.", 409);
    }

    // Create user
    const user = await User.create({ name, email, password, address, role });
    return successResponse(res, {}, "User registered successfully.", 201);
  } catch (err) {
    return errorResponse(res, "Registration failed.", 500, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, "Invalid credentials.", 401);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return errorResponse(res, "Invalid credentials.", 401);
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );
    // Include all user info needed for frontend routing
    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    return errorResponse(res, "Login failed.", 500, err.message);
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return validationErrorResponse(res, [
        "Old and new passwords are required.",
      ]);
    }
    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          "New password must be 8-16 chars, include uppercase and special char.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return errorResponse(res, "Old password is incorrect.", 401);

    user.password = newPassword;
    await user.save();
    return successResponse(res, {}, "Password updated successfully.");
  } catch (err) {
    return errorResponse(res, "Password update failed.", 500, err.message);
  }
};

// Optional: For JWT, logout is usually handled on the client by deleting the token.
// For demonstration, we can send a response.
const logout = (req, res) => {
  return successResponse(res, {}, "Logged out successfully.");
};

module.exports = { register, login, updatePassword, logout };
