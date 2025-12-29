const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Required fields
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    trim: true,
    maxlength: [20, "Username cannot be more than 20 characters"],
  },

  storeId:[],
  
  mobile: {
    type: String,
 
  },
  role: {
    type: String,
    enum: [
      "company",
      "company-employee",
      "distributor",
      "dealer",
      "mechanic",
      "customer",
      "admin",
    ],
    default: "customer",
  },
  password: {
    type: String,

    minlength: [6, "Password must be at least 6 characters"],
  },

  name: {
    type: String,
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  businessName: {
    type: String,
  },
  businessType: {
    type: String,
  },
  businessPan: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },









  myReferralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  usedReferralCode: {
    type: String,
    default: null,
  },
  referralPoints: {
    type: Number,
    default: 0,
  },
  
  // SIMPLE HISTORY - सिर्फ ये एक फील्ड ऐड करें
  referralHistory: [{
    mobile: String,
    date: {
      type: Date,
      default: Date.now
    },
    pointsEarned: {
      type: Number,
      default: 0
    }
  }],






















  panNumber: {
    type: String,
    uppercase: true,
    match: [/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Please add a valid PAN number"],
  },
  aadhaarNumber: {
    type: String,
    match: [/^[0-9]{12}$/, "Please add a valid 12 digit Aadhaar number"],
  },
  photo: {
    url: String,
    public_id: String,
  },
  address: String,
  state: String,
  district: String,
  pincode: {
    type: String,
    
  },
  wallet: {
    type: Number,
    default: 0,
  },
  otp: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },





 lastScannedAt: {
    type: Date,          
    default: null,
  },
 lastTransferedAt: {
    type: Date,          
    default: null,
  },






});

 




userSchema.pre('save', function(next) {
  if (!this.myReferralCode) {
    // Simple referral code: MOB + last 4 digits of mobile + random 3 letters
    const mobileLast4 = this.mobile ? this.mobile.slice(-4) : '0000';
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.myReferralCode = `${mobileLast4}${randomChars}`;
  }
  next();
});









// Update timestamp on update
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});


module.exports = mongoose.model("User", userSchema);
