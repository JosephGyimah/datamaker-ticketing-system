/**
 * Role-based access control middleware
 * Validates user roles and permissions
 */

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists on request (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user role is in allowed roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // User role not authorized
    return res
      .status(403)
      .json({ message: "Access forbidden: insufficient permissions" });
  };
};

module.exports = roleMiddleware;
