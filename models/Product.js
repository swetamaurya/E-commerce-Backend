// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, default: 0 }, // MRP for discount calculation
  stock: { type: Number, default: 0 },
  popularity: { type: Number, default: 80 }, // For sorting

  // Images with thumbnails support
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String, default: '' },
      thumbnail: { type: String }, // Thumbnail version
      isPrimary: { type: Boolean, default: false } // Primary image for cards
    }
  ],

  // Category with enum for better validation
  category: { 
    type: String, 
    enum: [
      'Area Rugs', 
      'Bath Mats', 
      'Bedside Runners', 
      'Cotton Yoga Mats', 
      'Mats Collection',
      'Other'
    ], 
    default: 'Other' 
  },
  brand: { type: String, default: 'Royal Thread' },
  
  // Product variants
  variants: [
    {
      size: String,
      color: String,
      price: Number,
      stock: { type: Number, default: 0 },
      sku: String // Stock keeping unit
    }
  ],

  // SEO fields
  // slug: { type: String, unique: true, sparse: true },
  // metaTitle: String,
  // metaDescription: String,
  // keywords: [String],

  // Product status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

}, { timestamps: true });

// Index for better query performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || (this.images.length > 0 ? this.images[0] : null);
});

// Virtual for thumbnail
productSchema.virtual('thumbnail').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  if (primaryImg && primaryImg.thumbnail) {
    return primaryImg.thumbnail;
  }
  return primaryImg ? primaryImg.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Method to get discount percentage
productSchema.methods.getDiscountPercentage = function() {
  if (this.mrp && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
};

module.exports = mongoose.model('Product', productSchema);
