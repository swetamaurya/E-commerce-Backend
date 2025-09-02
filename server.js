require("dotenv").config();
const express = require("express");
// const helmet = require("helmet");
const cors = require("cors");
// const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();
// app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// app.use(morgan("dev"));

// Database connection
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/addresses", require("./router/addresses"));
app.use("/api/products", require("./router/product"));
app.use("/api/cart", require("./router/cart"));
app.use("/api/wishlist", require("./router/wishlist"));
app.use("/api/orders", require("./router/orders"));
app.use("/api/payments", require("./router/payments"));
app.use("/api/user", require("./router/user"));
app.use("/api/products", require("./router/product"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal error" });
});

const PORT = process.env.PORT || 5002;
connectDB(process.env.MONGO_URL || "mongodb://localhost:27017/royal-thread").then(() => {
  app.listen(PORT, () => console.log(`[api] running on :${PORT}`));
});
