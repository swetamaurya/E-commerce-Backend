const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    // 1) check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 2) hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) create user
    const user = await User.create({ name, email, passwordHash, mobile, role });  

    // 4) jwt
    const token = jwt.sign(
      { id: user._id, role: user.role },                         // keep 'id' to match auth middleware  
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, mobile: user.mobile },         
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) find user (NO .lean() here — but we don't need methods anyway)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 2) compare password using bcrypt
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 3) issue JWT (keep the same payload key you use in middleware, e.g. id)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    // 4) respond
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          mobile: user.mobile 
        },
        token
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await User.findById(decoded.userId).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
});

// Logout endpoint (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

module.exports = router;
