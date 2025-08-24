// routes/auth.js
const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

// Register (sirf example)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = new User({ email, password });
    await user.save();
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
