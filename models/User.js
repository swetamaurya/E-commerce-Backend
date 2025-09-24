// models/Auth.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, default: "user" },
  mobile: String,
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
