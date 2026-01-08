// const mongoose = require('mongoose');

// const travelSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },
//   distance: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Compound index for faster queries
// travelSchema.index({ userId: 1, date: 1 });
// travelSchema.index({ date: -1 });

// // Pre-save hook to update updatedAt
// travelSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Travel', travelSchema);










const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  distanceIn: {
    type: Number,
    min: 0,
    default: 0
  },
  distanceOut: {
    type: Number,
    min: 0,
    default: 0
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  inEntered: {
    type: Boolean,
    default: false
  },
  outEntered: {
    type: Boolean,
    default: false
  },
  // Additional fields for better tracking
  travelCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate total distance (Out - In)
travelSchema.pre('save', function(next) {
  // Total travel = Distance Out - Distance In
  this.totalDistance = Math.max(0, (this.distanceOut || 0) - (this.distanceIn || 0));
  
  // Mark as completed if both distances are entered
  this.travelCompleted = this.inEntered && this.outEntered;
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for net distance (can be negative if in > out)
travelSchema.virtual('netDistance').get(function() {
  return (this.distanceOut || 0) - (this.distanceIn || 0);
});

// Indexes for faster queries
travelSchema.index({ userId: 1, date: 1 });
travelSchema.index({ date: -1 });
travelSchema.index({ userId: 1, date: -1 });
travelSchema.index({ travelCompleted: 1 });
travelSchema.index({ totalDistance: 1 });

// Static method to get user's monthly summary
travelSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalDistanceIn: { $sum: '$distanceIn' },
        totalDistanceOut: { $sum: '$distanceOut' },
        totalTravelDistance: { $sum: '$totalDistance' },
        averageDailyTravel: { $avg: '$totalDistance' },
        completedDays: {
          $sum: { $cond: [{ $and: ['$inEntered', '$outEntered'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Travel', travelSchema);