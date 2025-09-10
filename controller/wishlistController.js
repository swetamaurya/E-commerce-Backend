// controller/wishlistController.js
const Wishlist = require('../models/Wishlist');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      // If no wishlist exists, create an empty one
      wishlist = new Wishlist({
        user: userId,
        items: []
      });
      await wishlist.save();
    }
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, title, price, image } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    if (!productId || !title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, title, and price are required'
      });
    }
    
    // Find user's wishlist or create new one
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: []
      });
    }
    
    // Check if product already exists in wishlist
    const existingItem = wishlist.items.find(
      item => item.product === productId
    );
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }
    
    // Add new item to wishlist
    wishlist.items.push({
      product: productId,
      title,
      price,
      image,
      addedAt: new Date()
    });
    
    // Save wishlist
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Filter out the item to remove
    wishlist.items = wishlist.items.filter(item => item.product !== productId);
    
    // Save updated wishlist
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Clear all items
    wishlist.items = [];
    
    // Save empty wishlist
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: wishlist
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing wishlist'
    });
  }
};

// Check if item is in wishlist
exports.checkWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }
    
    // Check if product exists in wishlist
    const inWishlist = wishlist.items.some(item => item.product === productId);
    
    res.status(200).json({
      success: true,
      inWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking wishlist item'
    });
  }
};