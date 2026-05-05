const { body } = require("express-validator");

// REGISTER
exports.registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username required")
    .isLength({ min: 3 })
    .withMessage("Min 3 characters"),

  body("email").isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6+ chars"),
];

// LOGIN
exports.loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

// CREATE TASK
exports.createTaskValidation = [
  body("title").notEmpty().withMessage("Title required"),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"])
    .withMessage("Invalid status"),
];

// UPDATE TASK
exports.updateTaskValidation = [
  body("title").optional(),
  body("description").optional(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"])
    .withMessage("Invalid status"),
];