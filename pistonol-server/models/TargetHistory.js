// models/TargetHistory.js
const mongoose = require("mongoose");

const targetHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TargetHistory", targetHistorySchema);
