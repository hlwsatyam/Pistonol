const { default: mongoose } = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  clustermanager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  regionalmanager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Store = mongoose.model('Store', storeSchema);
 
module.exports=Store