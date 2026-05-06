const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes protected
router.use(protect);

// Create Task
router.post("/", createTask);

// Get My Tasks + Filtering + Search
router.get("/my-tasks", getTasks);

//  Admin → Get All Tasks
router.get("/all-tasks", roleMiddleware("admin"), (req, res, next) => {
  req.query.all = "true"; // trick to reuse controller
  next();
}, getTasks);

// Update Task
router.put("/:id", updateTask);

// Delete Task
router.delete("/:id", deleteTask);

module.exports = router;