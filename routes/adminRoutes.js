const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/users",
  protect,
  roleMiddleware("admin"),
  async (req, res, next) => {
    try {
      const [users] = await pool.execute(
        "SELECT id, username, email, role FROM users"
      );

      res.json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;