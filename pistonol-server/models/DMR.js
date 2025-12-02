// models/DMR.js
const mongoose = require('mongoose');

const monthlySaleSchema = new mongoose.Schema({
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  positionAsOnDate: Date,
  totalMonthSale: Number,
  totalSaleTillDate: Number,
  debtors: Number,
  creditors: Number,
  totalStock: Number,
  cashAtBank: Number,
  cashInHand: Number,
  purchaseOfBusinessAssets: Number,
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  }
}, { timestamps: true });

monthlySaleSchema.index({ distributor: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.model('MonthlySale', monthlySaleSchema);