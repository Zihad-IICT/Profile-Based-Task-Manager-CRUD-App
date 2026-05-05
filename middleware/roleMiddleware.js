module.exports = (role) => {
  return (req, res, next) => {
    try {
    
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // check role
      if (req.user.role !== role) {
        return res.status(403).json({
          message: `Access denied. ${role} only.`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: "Role check failed",
      });
    }
  };
};