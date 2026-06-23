const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ❌ validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields required ❌"
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists ❌"
      });
    }

    // 🔥 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully ✅"
    });

  } catch (err) {
    console.log("Register Error:", err.message);
    res.status(500).json({
      message: "Register error ❌"
    });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ❌ validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required ❌"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found ❌"
      });
    }

    // 🔥 compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password ❌"
      });
    }

    // ✅ TOKEN GENERATE (important fix)
    const token = jwt.sign(
      { id: user._id },   // 👈 only id required
      "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      token
    });

  } catch (err) {
    console.log("Login Error:", err.message);
    res.status(500).json({
      message: "Login error ❌"
    });
  }
});

module.exports = router;