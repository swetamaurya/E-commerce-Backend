require("dotenv").config();
const express = require("express");
const path = require("path");

const cors = require("cors");
const connectDB = require("./middilware/db");
const imageProxyRouter = require("./router/imageProxy");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Add image proxy routes
app.use('/api/images', imageProxyRouter);

// Optional: Add CORS for image serving
app.use('/api/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
  next();
});

// Routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/addresses", require("./router/addresses"));
app.use("/api/products", require("./router/product"));
app.use("/api/cart", require("./router/cart"));
app.use("/api/wishlist", require("./router/wishlist"));
app.use("/api/orders", require("./router/orders"));
app.use("/api/payments", require("./router/payments"));
app.use("/api/admin", require("./router/admin"));
// Optional: Add a test endpoint
app.get('/api/test-image-proxy', (req, res) => {
  res.json({
    success: true,
    message: 'Image proxy is working',
    testUrl: `${req.protocol}://${req.get('host')}/api/images/proxy/test-image.png`,
    healthCheck: `${req.protocol}://${req.get('host')}/api/images/health`
  });
});


  
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal error" });
});

const PORT = process.env.PORT || 5000;

// Start the server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
