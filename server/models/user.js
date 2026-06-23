const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ""
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  weight: {
    type: Number,
    default: 0
  },

  height: {
    type: Number,
    default: 0
  },

  age: {
    type: Number,
    default: 0
  },

  goal: {
    type: String,
    default: ""
  },

  water: {
    type: Number,
    default: 0
  },

  calories: {
    type: Number,
    default: 0
  },

  // 🔥 STREAK SYSTEM
  streak: {
    type: Number,
    default: 0
  },

  lastActive: {
    type: Date,
    default: null
  }

}, {
  timestamps: true   // ✅ createdAt + updatedAt auto handle karega
});

module.exports = mongoose.model("User", userSchema);