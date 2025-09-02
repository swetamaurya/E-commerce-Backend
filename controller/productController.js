// controller/productController.js
const Product = require('../models/Product');

// GET /api/products  -> list with only first image for cards (lighter payload)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}, {
      name: 1, price: 1, stock: 1, category: 1,
      images: { $slice: 1 } // send only first image for listing cards
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/:id -> full product with ALL images (detail/gallery)
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// (Optional) POST /api/products  -> create product (with images)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, category, brand, variants } = req.body;
    const doc = await Product.create({
      name, description, price, stock,
      images: Array.isArray(images) ? images : [],
      category, brand, variants
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
