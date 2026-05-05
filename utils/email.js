const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendResetEmail = async (toEmail, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email not configured, skipping email send");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Password Reset Request",
      text: `Reset your password using this link: ${resetUrl}`,
    });
  } catch (err) {
    console.error("Email error:", err.message);
  }
};