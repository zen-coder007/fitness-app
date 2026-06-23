const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "*", // production me specific domain use karna
}));
app.use(express.json());

// ===== ROUTES =====
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.post("/api/plan", (req, res) => {
  try {
    const { weight, height } = req.body;

    if (!weight || !height) {
      return res.status(400).json({ message: "Weight & Height required ❌" });
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    let goal = "";
    let response = {};

    // 🔥 GOAL AUTO DECIDE
    if (bmi < 18.5) goal = "weight gain";
    else if (bmi > 25) goal = "weight loss";
    else goal = "maintain";

    // 🔥 CALORIES
    const calories =
      goal === "weight loss"
        ? weight * 25
        : goal === "weight gain"
        ? weight * 35
        : weight * 30;

    // ================= WEIGHT LOSS =================
    if (goal === "weight loss") {
      response = {
        goal,
        bmi,
        calories,
        waterTarget: 3,

        diet: [
          "Oats",
          "Brown rice",
          "Boiled vegetables",
          "Salad",
          "Green tea"
        ],

        avoidFoods: [
          "Sugar",
          "Fried food",
          "Cold drinks",
          "Fast food"
        ],

        workout: [
          "Running",
          "Cycling",
          "Jump rope",
          "HIIT"
        ],

        exerciseAvoid: [
          "Heavy weight lifting",
          "Low movement exercises"
        ],

        gymPlan: [
          "Day 1: Cardio",
          "Day 2: HIIT",
          "Day 3: Abs",
          "Day 4: Cardio",
          "Day 5: Full Body",
          "Day 6: Yoga",
          "Day 7: Rest"
        ]
      };
    }

    // ================= WEIGHT GAIN =================
    else if (goal === "weight gain") {
      response = {
        goal,
        bmi,
        calories,
        waterTarget: 4,

        diet: [
          "Milk",
          "Eggs",
          "Banana",
          "Rice",
          "Peanut butter"
        ],

        avoidFoods: [
          "Skipping meals",
          "Junk food"
        ],

        workout: [
          "Weight training",
          "Squats",
          "Deadlift",
          "Bench press"
        ],

        exerciseAvoid: [
          "Too much cardio",
          "Overtraining"
        ],

        gymPlan: [
          "Day 1: Chest",
          "Day 2: Back",
          "Day 3: Legs",
          "Day 4: Shoulders",
          "Day 5: Arms",
          "Day 6: Core",
          "Day 7: Rest"
        ]
      };
    }

    // ================= MAINTAIN =================
    else {
      response = {
        goal,
        bmi,
        calories,
        waterTarget: 3.5,

        diet: ["Balanced diet", "Fruits", "Vegetables"],
        avoidFoods: ["Junk food"],
        workout: ["Walking", "Yoga"],
        exerciseAvoid: ["Overtraining"],
        gymPlan: ["Light full body workout"]
      };
    }

    res.json(response);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ===== MONGODB CONNECT =====
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => {
  console.log("Mongo Error ❌", err);
  process.exit(1);
});


// ==============================
// 🔥 PLAN API (MAIN FEATURE)
// ==============================

function calculateBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(2);
}

function calculateCalories(weight, goal) {
  if (goal === "weight loss") return weight * 25;
  if (goal === "weight gain") return weight * 35;
  return weight * 30;
}

app.post("/api/plan", (req, res) => {
  try {
    const { goal, weight, height } = req.body;

    if (!goal || !weight || !height) {
      return res.status(400).json({
        message: "All fields required ❌"
      });
    }

    const bmi = calculateBMI(weight, height);
    const calories = calculateCalories(weight, goal);

    let response = {};

    if (goal === "weight loss") {
      response = {
        bmi,
        calories,
        waterTarget: 3,
        diet: ["Oats", "Brown Rice", "Salad", "Fruits"],
        workout: ["Running", "Cycling", "HIIT"],
        avoid: ["Sugar", "Fried Food"],
        exerciseAvoid: ["Heavy lifting"],
        gymPlan: [
          "Day 1: Cardio",
          "Day 2: HIIT",
          "Day 3: Abs",
          "Day 4: Cardio",
          "Day 5: Full Body",
          "Day 6: Yoga",
          "Day 7: Rest"
        ],
        progress: Array.from({ length: 7 }, (_, i) => weight - i)
      };
    } 
    
    else if (goal === "weight gain") {
      response = {
        bmi,
        calories,
        waterTarget: 4,
        diet: ["Milk", "Eggs", "Banana", "Rice"],
        workout: ["Weight Training", "Squats", "Deadlift"],
        avoid: ["Skipping meals"],
        exerciseAvoid: ["Too much cardio"],
        gymPlan: [
          "Day 1: Chest",
          "Day 2: Back",
          "Day 3: Legs",
          "Day 4: Shoulders",
          "Day 5: Arms",
          "Day 6: Core",
          "Day 7: Rest"
        ],
        progress: Array.from({ length: 7 }, (_, i) => weight + i)
      };
    } 
    
    else {
      response = {
        bmi,
        calories,
        waterTarget: 3.5,
        diet: ["Balanced Diet"],
        workout: ["Walking", "Yoga"],
        avoid: ["Junk Food"],
        exerciseAvoid: ["Overtraining"],
        gymPlan: ["Light workout"],
        progress: Array(7).fill(weight)
      };
    }

    res.json(response);

  } catch (error) {
    console.log("PLAN ERROR:", error);
    res.status(500).json({
      message: "Server error ❌"
    });
  }
});


// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Server running ✅");
});


// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Something went wrong ❌" });
});


// ===== SERVER START =====
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});