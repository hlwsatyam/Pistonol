const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authController");
const jwt = require("jsonwebtoken");
router.post("/login", login);





















// // Route 1: Get user by username (for wallet transfer)
// router.get('/userwallet/:username', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username });
    
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     res.json({
//       success: true,
//       user: {
//         username: user.username,
//         name: user.name,
//         mobile: user.mobile,
//         wallet: user.wallet || 0,
//         email: user.email || 'N/A'
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// });

// // Route 2: Transfer amount to user's wallet
// router.post('/transfer-wallet', async (req, res) => {
//   try {
//     const { username, amount, adminName, notes } = req.body;

//     // Validate input
//     if (!username || !amount || amount <= 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Please provide valid username and amount' 
//       });
//     }

//     // Find user by username
//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     // Get current wallet balance
//     const currentBalance = user.wallet || 0;
    
//     // Update user's wallet amount
//     user.wallet = currentBalance + parseFloat(amount);
    
//     // Create transaction history (you might want to create a separate model for this)
//     if (!user.walletHistory) {
//       user.walletHistory = [];
//     }
    
//     user.walletHistory.push({
//       type: 'credit',
//       amount: parseFloat(amount),
//       date: new Date(),
//       adminName: adminName || 'Admin',
//       notes: notes || 'Direct wallet transfer',
//       previousBalance: currentBalance,
//       newBalance: user.wallet
//     });

//     // Update last transferred timestamp
//     user.lastTransferedAt = new Date();

//     await user.save();

//     res.json({
//       success: true,
//       message: `₹${amount} successfully transferred to ${username}'s wallet`,
//       transaction: {
//         amount: amount,
//         previousBalance: currentBalance,
//         newBalance: user.wallet,
//         transferDate: new Date()
//       },
//       user: {
//         username: user.username,
//         name: user.name,
//         mobile: user.mobile,
//         email: user.email
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// });

// // Optional: Get user's wallet history
// router.get('/wallet-history/:username', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username })
//       .select('walletHistory username name mobile');
    
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     res.json({
//       success: true,
//       walletHistory: user.walletHistory || [],
//       user: {
//         username: user.username,
//         name: user.name,
//         mobile: user.mobile
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// });
 

router.put('/set-company-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password required'
      });
    }

    const user = await User.findOneAndUpdate(
      { username: 'company123' },
      { password: newPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'COMPANY123 user not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated directly for COMPANY123'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});



// Route 1: Search users with auto-suggest (NO MODEL CHANGES)
router.get('/search-users/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      $and: [
        { username: { $ne: 'company123' } }, // Exclude admin from search
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { mobile: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username name mobile email wallet role')
    .limit(10);
console.log(users)
    res.json({
      success: true,
      users: users.map(user => ({
        username: user.username,
        name: user.name || user.username,
        mobile: user.mobile,
        email: user.email,
        wallet: user.wallet || 0,
        role: user.role,
        displayText: `${user.name || user.username} (${user.username}) - ${user.mobile}`
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Route 2: Get admin details
router.get('/admin-details', async (req, res) => {
  try {
    // Admin ka username aap props se le sakte hain ya hardcode
    const admin = await User.findOne({ username: 'company123' });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    res.json({
      success: true,
      admin: {
        username: admin.username,
        name: admin.name || 'Admin',
        wallet: admin.wallet || 0,
        mobile: admin.mobile,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Route 3: Transfer amount from admin to user (WITHOUT MODEL CHANGES)
router.post('/admin-transfer', async (req, res) => {
  try {
    const { username, amount, adminName, notes } = req.body;
    const adminUsername = 'company123'; // Ya props se lein

    // Validate input
    if (!username || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide valid username and amount' 
      });
    }

    // Find admin and user
    const [admin, user] = await Promise.all([
      User.findOne({ username: adminUsername }),
      User.findOne({ username })
    ]);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin account not found' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if admin has sufficient balance
    const adminBalance = admin.wallet || 0;
    if (adminBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Admin balance: ₹${adminBalance}`
      });
    }

    // Update admin wallet (deduct)
    admin.wallet = adminBalance - parseFloat(amount);
    
    // Store transaction in admin's referralHistory (since we can't modify model)
    if (!admin.referralHistory) {
      admin.referralHistory = [];
    }
    
    admin.referralHistory.push({
      mobile: user.mobile || 'N/A',
      date: new Date(),
      pointsEarned: -parseFloat(amount), // Negative for debit
      notes: `Transfer to ${user.username}: ${notes || 'Direct transfer'}`,
      transactionType: 'wallet_debit',
      toUser: user.username,
      toUserName: user.name
    });

    // Update user wallet (add)
    const userBalance = user.wallet || 0;
    user.wallet = userBalance + parseFloat(amount);
    
    // Store transaction in user's referralHistory
    if (!user.referralHistory) {
      user.referralHistory = [];
    }
    
    user.referralHistory.push({
      mobile: admin.mobile || 'N/A',
      date: new Date(),
      pointsEarned: parseFloat(amount), // Positive for credit
      notes: `Transfer from Admin: ${notes || 'Direct transfer'}`,
      transactionType: 'wallet_credit',
      fromAdmin: admin.username,
      fromAdminName: admin.name || 'Admin'
    });

    // Save both
    await Promise.all([admin.save(), user.save()]);

    // Create Transaction record (separate model, optional)
    const transaction = new Transaction({
      sender: admin._id,
      receiver: user._id,
      amount: parseFloat(amount),
      type: 'transfer',
      description: notes || `Admin transfer to ${user.username}`,
      createdAt: new Date()
    });

    await transaction.save();

    res.json({
      success: true,
      message: `₹${amount} successfully transferred to ${user.name || user.username}`,
      transaction: {
        amount: amount,
        adminPreviousBalance: adminBalance,
        adminNewBalance: admin.wallet,
        userPreviousBalance: userBalance,
        userNewBalance: user.wallet,
        transferDate: new Date()
      },
      user: {
        username: user.username,
        name: user.name || user.username,
        wallet: user.wallet
      },
      admin: {
        username: admin.username,
        name: admin.name || 'Admin',
        wallet: admin.wallet
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Transaction failed. Please try again.' 
    });
  }
});

// Route 4: Get user's wallet history (from referralHistory)
router.get('/wallet-history/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('referralHistory username name mobile wallet');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Filter only wallet transactions from referralHistory
    const walletHistory = (user.referralHistory || [])
      .filter(record => record.transactionType?.includes('wallet'))
      .map(record => ({
        type: record.transactionType === 'wallet_credit' ? 'credit' : 'debit',
        amount: Math.abs(record.pointsEarned || 0),
        date: record.date,
        adminName: record.fromAdminName || 'Admin',
        notes: record.notes || 'Wallet transfer',
        previousBalance: 0, // We don't have this in current structure
        newBalance: user.wallet || 0,
        counterparty: record.transactionType === 'wallet_credit' ? 
          `From: ${record.fromAdminName || 'Admin'}` : 
          `To: ${record.toUserName || 'User'}`
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      walletHistory: walletHistory,
      user: {
        username: user.username,
        name: user.name,
        mobile: user.mobile,
        wallet: user.wallet
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Route 5: Get admin's transaction history
router.get('/admin-transactions', async (req, res) => {
  try {
    const admin = await User.findOne({ username: 'company123' })
      .select('referralHistory username name wallet');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Get admin's wallet transactions from referralHistory
    const adminHistory = (admin.referralHistory || [])
      .filter(record => record.transactionType?.includes('wallet'))
      .map(record => ({
        type: 'debit', // Admin always debits
        amount: Math.abs(record.pointsEarned || 0),
        date: record.date,
        toUser: record.toUserName,
        toUsername: record.toUser,
        notes: record.notes,
        previousBalance: 0,
        newBalance: admin.wallet || 0
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      walletHistory: adminHistory,
      admin: {
        username: admin.username,
        name: admin.name || 'Admin',
        wallet: admin.wallet
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});























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


router.get('/users/search', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const user = await User.findOne({
      $or: [
        { username: username },
        { mobile: username }
      ]
    }).select('-password -otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching user'
    });
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
  getUserReferralInfo,
} = require("../controllers/userController");
const User = require("../models/User");
const sendEmail = require("../service/emailService");
const rolePermissions = require("../config/roleAccess");
const Transaction = require("../models/transaction");

router.post("/", registerUser);

router.get("/byrole/:role", getUsers);
router.route("/otp/send-otp").post(sendOtp);
router.route("/otp/verify").post(verify);
router.get('/user/:userId/referral-info',  getUserReferralInfo);
router.route("/users/profile").put(profile);
router.patch("/verify/:id", statusChange);
router.patch("/change-password/:id", passChange);
router.route("/:id").delete(deleteUser).get(getUserById).put(updateUser);

module.exports = router;
