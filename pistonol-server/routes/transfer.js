const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');

// // Transfer funds to company
// router.post('/transfer-to-company', async (req, res) => {
//   try {
//     const { senderId, amount } = req.body;
// console.log(req.body)
//     // Validate input
//     if (!senderId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Sender ID and amount are required'
//       });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount must be greater than 0'
//       });
//     }

//     // Find sender (distributor/mechanic)
//     const sender = await User.findById(senderId);
//     if (!sender) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sender not found'
//       });
//     }

//     // Check if sender has sufficient balance
//     if (sender.wallet < amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient wallet balance'
//       });
//     }

//     // Find company (receiver)
//     const company = await User.findOne({ role: 'company' });
//     if (!company) {
//       return res.status(404).json({
//         success: false,
//         message: 'Company not found'
//       });
//     }

//     // Start transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Deduct amount from sender
//       sender.wallet -= amount;
//       sender.lastTransferedAt = new Date();
//       await sender.save({ session });

//       // Add amount to company
//       company.wallet += amount;
//       await company.save({ session });

//       // Create transaction record
//       const transaction = new Transaction({
//         sender: senderId,
//         receiver: company._id,
//         amount: amount,
//         type: 'transfer'
//       });
//       await transaction.save({ session });

//       // Commit transaction
//       await session.commitTransaction();
//       session.endSession();

//       res.json({
//         success: true,
//         message: 'Funds transferred successfully',
//         transaction: transaction,
//         updatedWallet: sender.wallet
//       });

//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw error;
//     }

//   } catch (error) {
//     console.error('Transfer error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });



// Get company user
router.get('/users/company', async (req, res) => {
  try {
    const company = await User.findOne({ role: 'company' });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get users by role
router.get('/users/by-role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }, 'name businessName email mobile wallet role');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Generic transfer endpoint
router.post('/transfer', async (req, res) => {
  try {
    const { senderId, receiverId, amount } = req.body;
 
    // Validate input
    if (!senderId || !receiverId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, Receiver ID and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Find sender and receiver
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'Sender or receiver not found'
      });
    }

    // Check if sender has sufficient balance
    if (sender.wallet < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct amount from sender
      sender.wallet -= amount;
      sender.lastTransferedAt = new Date();
      await sender.save({ session });

      // Add amount to receiver
      receiver.wallet += amount;
      await receiver.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        sender: senderId,
        receiver: receiverId,
        amount: amount,
        type: 'transfer',
        description: `Transfer from ${sender.name} to ${receiver.businessName || receiver.name}`
      });
      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.json({
        success: true,
        message: 'Funds transferred successfully',
        transaction: transaction,
        updatedWallet: sender.wallet
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
















// Get user transactions
router.get('/user-transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name username role')
    .populate('receiver', 'name username role')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions: transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user wallet balance
router.get('/wallet-balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('wallet name username');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      wallet: user.wallet,
      user: {
        name: user.name,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;