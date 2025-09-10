// models/Cart.js
const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: { type: String, required: true }, // Product ID
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  title: { type: String, required: true },
  image: { type: String },
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [CartItemSchema],
  total: { type: Number, default: 0 },
}, { timestamps: true });

// Calculate total price before saving
CartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

module.exports = mongoose.model("Cart", CartSchema);