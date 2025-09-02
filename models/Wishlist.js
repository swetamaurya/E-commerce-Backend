// models/Wishlist.js
const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema({
  product: { type: String, required: true }, // Product ID
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [WishlistItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", WishlistSchema);