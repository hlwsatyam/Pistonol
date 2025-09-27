const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Import your user model

const connectDB = async () => {
  try {
     await mongoose.connect(
      "mongodb://myUser:myPassword123@168.231.102.215:27017/pistonol?authSource=admin"
    );
    console.log("✅ MongoDB connected");

    // Ensure company user exists
    const defaultCompanyUser = {
      username: "company123",
      password: "company@123",  
      role: "company",
      name: "Default Company",
      email: "techmintlab@gmail.com", 
      mobile: "9999999999",
      isVerify: true,
    };

    let companyUser = await User.findOne({ role: "company" });
    if (!companyUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultCompanyUser.password, salt);

      companyUser = new User({
        ...defaultCompanyUser,
        password: hashedPassword,
      });

      await companyUser.save();
      console.log("✅ Default company user created");
    } else {
      console.log("ℹ️ Company user already exists");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
