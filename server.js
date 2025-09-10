<<<<<<< HEAD
require("dotenv").config();
const express = require("express");
// const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./middilware/db");
// const morgan = require("morgan");
 
const app = express();
// app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/addresses", require("./router/addresses"));
app.use("/api/products", require("./router/product"));
app.use("/api/cart", require("./router/cart"));
app.use("/api/wishlist", require("./router/wishlist"));
app.use("/api/orders", require("./router/orders"));
app.use("/api/payments", require("./router/payments"));
  
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal error" });
});

const PORT = process.env.PORT || 5002;
 
// console.log("Connecting to database:", process.env.MONGO_URI);
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`[api] running on :${PORT}`));
});
=======
require("dotenv").config();
const express = require("express");
// const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./middilware/db");
// const morgan = require("morgan");
 
const app = express();
// app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/addresses", require("./router/addresses"));
app.use("/api/products", require("./router/product"));
app.use("/api/cart", require("./router/cart"));
app.use("/api/wishlist", require("./router/wishlist"));
app.use("/api/orders", require("./router/orders"));
app.use("/api/payments", require("./router/payments"));
  
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal error" });
});

const PORT = process.env.PORT || 5002;
 
// console.log("Connecting to database:", process.env.MONGO_URI);
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`[api] running on :${PORT}`));
});
>>>>>>> ae6a86e23afb5d6a6992308378412a80b12a9edb
