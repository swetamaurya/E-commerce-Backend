// middilware/auth.js
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = auth;   // <-- export the function, not { auth }
