const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const History = require("../models/history");


// ================= PROFILE =================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    res.json({ user });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching user ❌" });
  }
});


// ================= DASHBOARD =================
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    res.json({
      water: user.water || 0,
      calories: user.calories || 0,
      goal: user.goal || "",
      streak: user.streak || 0
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= WATER =================
router.post("/water", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const amount = Number(req.body.amount) || 0.5;

    user.water = (user.water || 0) + amount;

    await user.save();

    res.json({
      message: "Water updated 💧",
      totalWater: user.water
    });

  } catch (error) {
    console.log("Water Error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= CALORIES =================
router.post("/calories", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const amount = Number(req.body.amount) || 100;

    user.calories = (user.calories || 0) + amount;

    await user.save();

    res.json({
      message: "Calories updated 🍗",
      totalCalories: user.calories
    });

  } catch (error) {
    console.log("Calories Error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= GOAL =================
router.post("/goal", authMiddleware, async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ message: "Goal required ❌" });
    }

    const user = await User.findById(req.user.id);

    user.goal = goal;

    await user.save();

    res.json({
      message: "Goal updated 🎯",
      goal: user.goal
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= RESET + HISTORY + STREAK =================
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const today = new Date();

    // 🔥 SAVE HISTORY (force timestamp)
    await History.create({
      userId: user._id.toString(),
      water: user.water || 0,
      calories: user.calories || 0,
      goal: user.goal || "",
      createdAt: today
    });

    // 🔥 FIXED STREAK LOGIC
    if (user.lastActive) {
      const last = new Date(user.lastActive);

      const diffDays = Math.floor(
        (today.setHours(0,0,0,0) - last.setHours(0,0,0,0)) /
        (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    user.lastActive = new Date();

    // 🔄 RESET VALUES
    user.water = 0;
    user.calories = 0;

    await user.save();

    res.json({
      message: "Saved, Reset & Streak Updated 🔥",
      streak: user.streak
    });

  } catch (error) {
    console.log("Reset Error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= HISTORY =================
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const data = await History.find({
      userId: req.user.id.toString()
    }).sort({ createdAt: 1 });

    res.json({
      history: data
    });

  } catch (error) {
    console.log("History Error:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// ================= UPDATE FITNESS =================
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { weight, height, age, goal } = req.body;

    const user = await User.findById(req.user.id);

    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (age !== undefined) user.age = age;
    if (goal !== undefined) user.goal = goal;

    await user.save();

    res.json({
      message: "Fitness data updated ✅",
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;