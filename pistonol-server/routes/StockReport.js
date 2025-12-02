// models/StockReport.js
const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  volumeSize: {
    type: String,
    required: true
  },
  quantityInBox: {
    type: Number,
    required: true,
    min: 0
  }
});

const stockReportSchema = new mongoose.Schema({
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
  stockItems: [stockItemSchema],
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },
  submittedAt: Date
}, { timestamps: true });

// Compound index
stockReportSchema.index({ distributor: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('StockReport', stockReportSchema);