const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: String,
  date: { type: Date, default: Date.now },
  water: Number,
  calories: Number,
  goal: String
});

module.exports = mongoose.model("History", historySchema);