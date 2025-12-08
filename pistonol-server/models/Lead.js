 


const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  garageName: String,
  businessCardNumber: String,
  contactName: String,
  mobile: String,
  comment: String,
  address: String,
  state: String,
  city: String,
  proofImageUrl: String,
  pincode: String,
  servicesOffered: String,
  status: { type: String, default: 'New' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedbacks: [feedbackSchema],

  currentLocation: {
      latitude: Number,
      longitude: Number
    },


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);