const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided ❌"
      });
    }

    // ❌ Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token format invalid ❌"
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ❌ Empty token
    if (!token) {
      return res.status(401).json({
        message: "Token missing ❌"
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, "secret123");

    // ✅ Attach only user id (important)
    req.user = {
      id: decoded.id
    };

    next();

  } catch (err) {
    console.log("JWT Error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token ❌"
    });
  }
};

module.exports = authMiddleware;