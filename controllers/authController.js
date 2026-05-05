const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/email");

const SECRET = process.env.JWT_SECRET || "secret";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, SECRET, { expiresIn: "1d" });

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const [exists] = await pool.execute(
      "SELECT id FROM users WHERE email=? OR username=?",
      [email, username]
    );

    if (exists.length)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)",
      [username, email, hashed, role || "user"]
    );

    const token = generateToken(result.insertId, role || "user");

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id, user.role);

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    const expiry = new Date(Date.now() + 3600000);

    await pool.execute(
      "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE email=?",
      [token, expiry, email]
    );

    await sendResetEmail(email, token);

    res.json({ message: "Reset email sent", token });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE reset_token=? AND reset_token_expiry > NOW()",
      [token]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid token" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?",
      [hashed, rows[0].id]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};