const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authController");
const jwt = require("jsonwebtoken");
router.post("/login", login);


 router.post("/page-verify", async (req, res) => {
  try {
    // 1. parse user string
    const parsedUser = JSON.parse(req.body.user);

    // 2. username ya email nikalo
    const { email, username } = parsedUser;

    let user;
    if (email) {
      user = await User.findOne({ email }).select("-password");
    } else if (username) {
      user = await User.findOne({ username }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. full details bhej do
    res.json({ success: true,   user: {
      isVerify:user.isVerify,
        _id: user._id,
        username: user.username,
        role: user.role,
        wallet: user.wallet,
        permissions: rolePermissions[user.role] || [],
      }, });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/register", register);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    await user.save();

    await sendEmail({
      from: '"Pistonol Support" <yourdummy@gmail.com>',
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is <b>${otp}</b></h3>
             <p>Valid for 10 minutes</p>`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Verify OTP & Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== Number(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    // Hash password
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = null; // clear OTP
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



const {
  registerUser,
  sendOtp,
  getUsers,
  deleteUser,
  verify,
  getUserById,
  profile,
  updateUser,
  statusChange,
  passChange,
} = require("../controllers/userController");
const User = require("../models/User");
const sendEmail = require("../service/emailService");
const rolePermissions = require("../config/roleAccess");

router.post("/", registerUser);

router.get("/byrole/:role", getUsers);
router.route("/otp/send-otp").post(sendOtp);
router.route("/otp/verify").post(verify);
router.route("/users/profile").put(profile);
router.patch("/verify/:id", statusChange);
router.patch("/change-password/:id", passChange);
router.route("/:id").delete(deleteUser).get(getUserById).put(updateUser);

module.exports = router;
