require("dotenv").config();
const express = require("express");
const path = require("path");

const cors = require("cors");
const connectDB = require("./middilware/db");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/addresses", require("./router/addresses"));
app.use("/api/products", require("./router/product"));
app.use("/api/cart", require("./router/cart"));
app.use("/api/wishlist", require("./router/wishlist"));
app.use("/api/orders", require("./router/orders"));
app.use("/api/payments", require("./router/payments"));
app.use("/api/admin", require("./router/admin"));


  
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal error" });
});

const PORT = process.env.PORT || 6001;

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
