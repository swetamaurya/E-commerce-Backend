// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
