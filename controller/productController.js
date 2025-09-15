const Product = require('../models/Product');

// Get all products (unified for both users and admins)
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, search, admin } = req.query;
    
    // Check if this is an admin request
    const isAdmin = admin === 'true' && req.user && req.user.role === 'admin';
    
    // Build base query
    let query = {};
    
    // For regular users, only show active products
    // For admins, show all products (including inactive)
    if (!isAdmin) {
      query.isActive = true;
    }
    
    // Apply category filter
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    
    // Apply featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Apply search filter (for admin)
    if (search && isAdmin) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
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

    // Return different response format based on user type
    if (isAdmin) {
      res.json({
        success: true,
        data: productsWithId,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: parseInt(page) < Math.ceil(total / limit),
          hasPrevPage: parseInt(page) > 1
        }
      });
    } else {
      res.json({
        success: true,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        data: productsWithId
      });
    }
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
    let { category } = req.params;
    const { page = 1, limit = 10 } = req.query;


    //    enum: [
    //   'Area Rugs', 
    //   'Bath Mats', 
    //   'Bedside Runners', 
    //   'Cotton Yoga Mats', 
    //   'Mats Collection',
    //   'Other'
    // ], 



    if(category === 'bedside-runners') {
      category = 'Bedside Runners';
    }else if(category === 'area-rugs') {
      category = 'Area Rugs';
    }else if(category === 'bath-mats') {
      category = 'Bath Mats';
    }else if(category === 'cotton-yoga-mats') {
      category = 'Cotton Yoga Mats';
    }else if(category === 'mats-collection') {
      category = 'Mats Collection';
    }else if(category === 'other') {
      category = 'Other';
    }


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
    // Auth guard (route also protects, but double-check)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const {
      name, description, category, brand, meterial,
      colors, sizes,
      price, mrp, stock,
      images,
      specialFeature, isActive, isFeatured
    } = req.body;

    // Required fields for simplified (non-variant) product
    if (!name || !description || !category || !meterial || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, category, meterial, price, stock'
      });
    }

    // Normalize images: accept string[] or object[]
    const processedImages = Array.isArray(images)
      ? images
          .filter(img => (typeof img === 'string' ? img.trim() : img?.url))
          .slice(0, 10)
          .map((img, idx) =>
            typeof img === 'string'
              ? { url: img.trim(), alt: `Product image ${idx + 1}`, isPrimary: idx === 0 }
              : {
                  url: img.url.trim(),
                  alt: img.alt?.trim() || `Product image ${idx + 1}`,
                  thumbnail: img.thumbnail?.trim(),
                  isPrimary: Boolean(img.isPrimary)
                }
          )
      : [];

    // CRITICAL FIX: Ensure only ONE image has isPrimary: true
    if (processedImages.length > 0) {
      const primaryImageIndex = processedImages.findIndex(img => img.isPrimary === true);
      const finalImages = processedImages.map((img, index) => ({
        ...img,
        isPrimary: index === (primaryImageIndex >= 0 ? primaryImageIndex : 0)
      }));
      processedImages.splice(0, processedImages.length, ...finalImages);
    }

    const doc = new Product({
      name: name.toString().trim(),
      description: description.toString().trim(),
      category: category.toString().trim(),
      brand: brand?.toString().trim() || 'Royal Thread',
      meterial: meterial.toString().trim(),
      colors: Array.isArray(colors) ? colors.map(c => c.toString().trim()).filter(Boolean) : [],
      sizes: Array.isArray(sizes) ? sizes.map(s => s.toString().trim()).filter(Boolean) : [],
      price: Number(price),
      mrp: mrp !== undefined ? Number(mrp) : Number(price),
      stock: parseInt(stock, 10),
      images: processedImages,
      specialFeature: specialFeature?.toString().trim() || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false
    });

    // Validate explicitly to return readable 400s
    try {
      await doc.validate();
    } catch (ve) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ve.errors
          ? Object.fromEntries(Object.entries(ve.errors).map(([k, v]) => [k, v.message]))
          : ve.message
      });
    }

    await doc.save(); // pre-save will create slug and SKU

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: doc
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error creating product', error: err.message });
  }
};


// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      name, description, price, mrp, stock, images, category, brand, meterial,
      colors, sizes,
      variants, metaTitle, metaDescription, keywords, isActive, isFeatured, popularity, specialFeature
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
    if (meterial) product.meterial = meterial.trim();
    if (specialFeature !== undefined) product.specialFeature = specialFeature.trim();
    if (metaTitle) product.metaTitle = metaTitle.trim();
    if (metaDescription) product.metaDescription = metaDescription.trim();
    if (keywords) product.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()).filter(k => k);
    if (variants) product.variants = variants;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (popularity !== undefined) product.popularity = typeof popularity === 'number' ? popularity : parseInt(popularity);
    
    // Update colors and sizes
    if (colors !== undefined) {
      product.colors = Array.isArray(colors) ? colors.map(c => c.toString().trim()).filter(Boolean) : [];
    }
    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes) ? sizes.map(s => s.toString().trim()).filter(Boolean) : [];
    }

    // Handle images - normalize to object array and delete old images
    if (images && Array.isArray(images)) {
      const fs = require('fs');
      const path = require('path');
      
      // Delete old images that are no longer in the new images array
      const oldImageUrls = product.images.map(img => img.url);
      const newImageUrls = images
        .filter(img => img && (typeof img === 'string' ? img.trim() : img?.url))
        .map(img => typeof img === 'string' ? img.trim() : img.url.trim());
      
      // Find images to delete
      const imagesToDelete = oldImageUrls.filter(url => !newImageUrls.includes(url));
      
      // Delete old images from file system
      imagesToDelete.forEach(imageUrl => {
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '..', imageUrl);
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log('Deleted old image:', imagePath);
            }
          } catch (error) {
            console.error('Error deleting old image:', imagePath, error);
          }
        }
      });
      
      // Debug: Log incoming images data
      console.log('=== UPDATE PRODUCT - INCOMING IMAGES ===');
      console.log('Raw images from frontend:', JSON.stringify(images, null, 2));

      // Process new images - preserve isPrimary from frontend
      const processedImages = images
        .filter(img => img && (typeof img === 'string' ? img.trim() : img?.url))
        .slice(0, 10)
        .map((img, index) => {
          const processed = typeof img === 'string'
            ? { url: img.trim(), alt: `Product image ${index + 1}`, isPrimary: index === 0 }
            : {
                url: img.url.trim(),
                alt: img.alt?.trim() || `Product image ${index + 1}`,
                thumbnail: img.thumbnail?.trim(),
                isPrimary: Boolean(img.isPrimary)
              };
          console.log(`Image ${index}:`, processed);
          return processed;
        });

      console.log('Processed images:', JSON.stringify(processedImages, null, 2));
      
      // CRITICAL FIX: Ensure only ONE image has isPrimary: true
      // Find the image that should be primary (first one with isPrimary: true)
      const primaryImageIndex = processedImages.findIndex(img => img.isPrimary === true);
      console.log('Primary image index found:', primaryImageIndex);
      
      // Reset all images to isPrimary: false, then set only one as primary
      const finalImages = processedImages.map((img, index) => ({
        ...img,
        isPrimary: index === primaryImageIndex
      }));
      
      console.log('Final images with single primary:', JSON.stringify(finalImages, null, 2));
      product.images = finalImages;
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
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Find product first to get image paths
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images from file system
    if (product.images && product.images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      product.images.forEach(image => {
        if (image.url && image.url.startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '..', image.url);
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log('Deleted image:', imagePath);
            }
          } catch (error) {
            console.error('Error deleting image:', imagePath, error);
          }
        }
      });
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product and associated images deleted successfully'
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