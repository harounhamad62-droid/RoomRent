const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret"
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
}

module.exports = {
  authenticate,
  requireAdmin
};
