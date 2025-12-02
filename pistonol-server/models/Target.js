// models/Target.js
const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"]
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  achievedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one target per user per month
targetSchema.index({ userId: 1, month: 1 }, { unique: true });

targetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Target", targetSchema);