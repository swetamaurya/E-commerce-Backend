const Product = require('../models/Product');

// Get all products (public)
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product.toObject(),
      id: product._id
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: productsWithId
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products',
      error: err.message
    });
  }
};

// Get product by ID (public)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add id field for frontend compatibility
    const productWithId = {
      ...product.toObject(),
      id: product._id
    };

    res.json({
      success: true,
      data: productWithId
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product',
      error: err.message
    });
  }
};

// Get products by category (public)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { 
      category: { $regex: new RegExp(category, 'i') },
      isActive: true 
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ popularity: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product.toObject(),
      id: product._id
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: productsWithId
    });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products by category',
      error: err.message
    });
  }
};

// Get featured products (public)
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
    .sort({ popularity: -1, createdAt: -1 })
    .limit(10);

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product.toObject(),
      id: product._id
    }));

    res.json({
      success: true,
      data: productsWithId
    });
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products',
      error: err.message
    });
  }
};

// Search products (public)
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: [],
        message: 'Please provide a search query'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { brand: searchRegex },
            { keywords: { $in: [searchRegex] } }
          ]
        }
      ]
    })
    .sort({ popularity: -1, createdAt: -1 })
    .limit(20);

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product.toObject(),
      id: product._id
    }));

    res.json({
      success: true,
      data: productsWithId,
      query: q.trim()
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error searching products',
      error: err.message
    });
  }
};

// Create product (admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, mrp, stock, images, category, brand,
      variants,  isActive, isFeatured, popularity
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, category, stock'
      });
    }

    // Process images - convert string array to object array if needed
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images
        .filter(img => img && typeof img === 'string' && img.trim())
        .slice(0, 10)
        .map((img, index) => ({
          url: img.trim(),
          alt: `Product image ${index + 1}`,
          isPrimary: index === 0
        }));
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const product = new Product({
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : parseFloat(price) * 1.5,
      stock: parseInt(stock),
      images: processedImages,
      category: category.trim(),
      brand: brand?.trim() || 'Royal Thread',
      variants: variants || [],
      // metaTitle: metaTitle?.trim() || name.trim(),
      // metaDescription: metaDescription?.trim() || description?.trim() || '',
      // keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : []),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      popularity: popularity ? parseInt(popularity) : 80,
      slug
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: err.message
    });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, mrp, stock, images, category, brand,
      variants, metaTitle, metaDescription, keywords, isActive, isFeatured, popularity
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update basic fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = typeof price === 'number' ? price : parseFloat(price);
    if (mrp !== undefined) product.mrp = typeof mrp === 'number' ? mrp : parseFloat(mrp);
    if (stock !== undefined) product.stock = typeof stock === 'number' ? stock : parseInt(stock);
    if (category) product.category = category.trim();
    if (brand) product.brand = brand.trim();
    if (metaTitle) product.metaTitle = metaTitle.trim();
    if (metaDescription) product.metaDescription = metaDescription.trim();
    if (keywords) product.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()).filter(k => k);
    if (variants) product.variants = variants;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (popularity !== undefined) product.popularity = typeof popularity === 'number' ? popularity : parseInt(popularity);

    // Handle images - convert string array to object array if needed
    if (images && Array.isArray(images)) {
      const processedImages = images
        .filter(img => img && typeof img === 'string' && img.trim())
        .slice(0, 10)
        .map((img, index) => ({
          url: img.trim(),
          alt: `Product image ${index + 1}`,
          isPrimary: index === 0
        }));
      
      product.images = processedImages;
    }

    // Generate slug if name changed
    if (name) {
      product.slug = name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating product',
      error: err.message
    });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product',
      error: err.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
};