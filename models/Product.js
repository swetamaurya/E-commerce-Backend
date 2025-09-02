// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },

  // IMPORTANT: first image is used on card; detail page shows all
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String, default: '' }
    }
  ],

  category: { type: String, default: 'Other' },
  brand: { type: String, default: 'Generic' },
  variants: [
    {
      size: String,
      color: String,
      price: Number,
      stock: { type: Number, default: 0 }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
