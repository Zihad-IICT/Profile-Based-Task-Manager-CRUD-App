const express = require("express");
const pool = require("../config/db");

const {
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);



router.post("/", async (req, res) => {
  const { title, description } = req.body;

  await pool.execute(
    "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)",
    [title, description, req.user.id]
  );

  res.json({ message: "Task created" });
});


router.get("/my-tasks", async (req, res) => {
  const [tasks] = await pool.execute(
    "SELECT * FROM tasks WHERE user_id = ?",
    [req.user.id]
  );

  res.json(tasks);
});



router.get(
  "/all-tasks",
  roleMiddleware("admin"),
  async (req, res) => {
    const [tasks] = await pool.execute("SELECT * FROM tasks");
    res.json(tasks);
  }
);


router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;