const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    const products = await Product.find({}).limit(2);
    
    console.log('\n=== PRODUCT IMAGES DATA ===');
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}: ${product.name}`);
      console.log('Images:', JSON.stringify(product.images, null, 2));
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
