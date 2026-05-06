const pool = require("../config/db");

// CREATE TASK
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
      [req.user.id, title, description || null, status || "pending"]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

// GET TASKS (Filtering + Search + Admin Support)
exports.getTasks = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let query = "";
    let params = [];

    // 🔹 Admin → all tasks
    if (isAdmin && req.query.all === "true") {
      query = `
        SELECT t.*, u.username 
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
    } else {
      query = "SELECT * FROM tasks WHERE user_id=?";
      params.push(userId);
    }

    // 🔹 Filter by status
    if (status) {
      query += " AND status=?";
      params.push(status);
    }

    // 🔹 Search by title
    if (search) {
      query += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(query, params);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// UPDATE TASK
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const [rows] = await pool.execute(
      "SELECT * FROM tasks WHERE id=?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = rows[0];

    // Authorization check
    if (task.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pool.execute(
      "UPDATE tasks SET title=?, description=?, status=? WHERE id=?",
      [
        title || task.title,
        description || task.description,
        status || task.status,
        req.params.id,
      ]
    );

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    next(err);
  }
};

// DELETE TASK
exports.deleteTask = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM tasks WHERE id=?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = rows[0];

    //  Authorization check
    if (task.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pool.execute("DELETE FROM tasks WHERE id=?", [req.params.id]);

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};