const QRCode = require("../models/QRCode");
const User = require("../models/User");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const { default: mongoose } = require("mongoose");
const transactionx = require("../models/transaction");
const transaction = require("../models/transaction");

// Ensure directory exists
const outputDir = path.join(__dirname, "..", "generated_qrcodes");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function generate8DigitCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// exports.generateQRCodes = async (req, res) => {

//   try {
//     const { value, quantity, batchNumber } = req.body;
//     const qrCodes = [];

//     await updateCompanyWallet(quantity * value);

//     for (let i = 0; i < quantity; i++) {
//       const qrCodeData = {
//         value: value,
//         batchNumber: batchNumber + "-" + (i + 1),
//         quantity: 1,
//         status: "active",
//         cost: 1,
//       };

//       const qrCode = await QRCode.create(qrCodeData);
//       qrCodes.push(qrCode);
//     }

//     res.status(201).json(qrCodes);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// Helper function to update company wallet

exports.generateQRCodes = async (req, res) => {
  try {
    const { value, quantity, client,   batchNumber } = req.body;
    const qrCodes = [];



   // ✅ 1. Find company user
    const companyUser = await User.findOne({
      username: "company123",
    });

    // ❌ If company account not found
    if (!companyUser) {
      return res.status(400).json({
        success: false,
        message: "Company account (company123) not found. QR not generated."
      });
    }

    const totalAmount = value * quantity;

    // 2️⃣ Wallet balance check
    if (companyUser.wallet < totalAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient wallet balance"
      });
    }

    // 3️⃣ Cut wallet balance
    companyUser.wallet -= totalAmount;
    await companyUser.save({   });





    await transaction.create([{
      sender: companyUser._id,
      receiver: companyUser._id,
      amount: totalAmount,
      type: "transfer",
      description: `QR generation (${quantity} × ${value})`
    }], {   });






    for (let i = 0; i < quantity; i++) {
      const uniqueCode = generate8DigitCode();
      const fullBatch = `${batchNumber}-${i + 1}`;

      // QR Payload as raw JSON string
      const qrPayload = JSON.stringify({
        value,
        batch: fullBatch,
        code: uniqueCode,
      });

      // Generate QR Code Data URL
      const qrDataUrl = await require("qrcode").toDataURL(qrPayload, {
        errorCorrectionLevel: "H", // High level for robustness
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Canvas size
      const canvas = createCanvas(400, 500);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code image
      const qrImage = await loadImage(qrDataUrl);
      ctx.drawImage(qrImage, 100, 50, 200, 200);

      // Batch and Unique Code below
      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Batch: ${fullBatch}`, 200, 300);
      ctx.fillText(`Code: ${uniqueCode}`, 200, 340);

      // Save to file
      const fileName = `qr_${fullBatch}_${uniqueCode}.png`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      // Save to DB
      const qrCodeDoc = await QRCode.create({
        value,client,
        uniqueCode,
        batchNumber: fullBatch,
        quantity: 1,
        status: "active",
        imageUrl: `/generated_qrcodes/${fileName}`,
      });

      qrCodes.push(qrCodeDoc);
    }

    res.status(201).json(qrCodes);
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};






const updateCompanyWallet = async (amount, cond = "", oldAmount = "") => {
  try {
    const company = await User.findOne({ role: "company" });
    if (!company) {
      throw new Error("Company user not found");
    }
    if (cond) {
      company.wallet = company.wallet - oldAmount;
      company.wallet += amount;
    } else {
      company.wallet += amount;
    }

    await company.save();
    return company;
  } catch (error) {
    throw error;
  }
};

// exports.generateQRCodes = async (req, res) => {

//   try {
//     const { value, quantity, batchNumber } = req.body;
//     const qrCodes = [];

//     await updateCompanyWallet(quantity * value);

//     for (let i = 0; i < quantity; i++) {
//       const qrCodeData = {
//         value: value,
//         batchNumber: batchNumber + "-" + (i + 1),
//         quantity: 1,
//         status: "active",

//       };

//       const qrCode = await QRCode.create(qrCodeData);
//       qrCodes.push(qrCode);
//     }

//     res.status(201).json(qrCodes);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (qrCode) {
      // Refund to company wallet when deleting
      // await updateCompanyWallet(-qrCode.value);

      await qrCode.deleteOne();
      res.json({ message: "QR code removed" });
    } else {
      res.status(404).json({ message: "QR code not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    let d = qrCode;
    if (qrCode) {
      const oldStatus = qrCode.status;
      const newStatus = req.body.status;

      qrCode.value = req.body.value || qrCode.value;
      qrCode.status = newStatus || qrCode.status;

      // Update wallet if status changes from active to used/inactive or vice versa
      if (oldStatus !== newStatus) {
        let walletChange = 0;

        if (newStatus === "active" && oldStatus !== "active") {
          // Deduct if activating
          walletChange = -(qrCode.cost || 1);
        } else if (newStatus !== "active" && oldStatus === "active") {
          // Refund if deactivating
          walletChange = qrCode.value || 1;
        }

        if (walletChange !== 0) {
          await updateCompanyWallet(walletChange, "update", d.value);
        }
      }

      const updatedQRCode = await qrCode.save();
      res.json(updatedQRCode);
    } else {
      res.status(404).json({ message: "QR code not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all QR codes
// @route   GET /api/qrcodes
// @access  Private
exports.getQRCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const batch = req.query.batch || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    
    // Search filter (value or batchNumber)
    if (search) {
      filter.$or = [
        { value: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && ['active', 'used', 'inactive'].includes(status)) {
      filter.status = status;
    }
    
    // Batch filter
    if (batch) {
      filter.batchNumber = batch;
    }

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder;

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const qrCodes = await QRCode.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
  
      .select('-__v');

    // Get total count for pagination
    const total = await QRCode.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: qrCodes,
      pagination: {
        current: page,
        pages: totalPages,
        total: total,
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.verifyQRCodes = async (req, res) => {
//   const { code, _id, role } = req.body;
//   console.log(code, _id, role);
   
//   try {
//     const user = await User.findById(_id);
   
//     if (!user) {
//       return res.status(404).json({ message: "Userr not found" });
//     }


// let parsedCode = code;
// try {
//   const temp = JSON.parse(code);
//   parsedCode = temp?.code || code;
// } catch (e) {
//   parsedCode = code; // fallback if it's not JSON
// }


//     // Step 1: Find the QR code by uniqueCode
//     const qrCode = await QRCode.findOne({ uniqueCode: parsedCode, client: role });

//     if (!qrCode) {
//       return res
//         .status(404)
//         .json({ message: "QR Code not found For This User" });
//     }

//     if (qrCode.status !== "active") {
//       return res.status(400).json({ message: `QR Code is ${qrCode.status}` });
//     }

//     // Step 2: Update QR Code status to "used"
//     qrCode.status = "used";
//     qrCode.user = _id;
//     qrCode.scannedAt = new Date();
//     await qrCode.save();

//     // Step 3: Credit value to user's wallet

//     user.wallet += parseInt(qrCode.value);
//     user.lastScannedAt = new Date();
//     await user.save();

//     // ✅ Success
//     return res.json({
//       message: "QR Code verified successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("QR Verification Error:", error);
//     res.status(500).json({
//       message: error.message || "Server error during QR Code verification",
//     });
//   }
// };






exports.verifyQRCodes = async (req, res) => {
  const { code, _id, role } = req.body;
  console.log('Verification request:', { code, _id, role });
  
  try {
    // Step 1: Find user
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Step 2: Parse QR code
    let parsedCode = code;
    try {
      const temp = JSON.parse(code);
      parsedCode = temp?.code || code;
    } catch (e) {
      parsedCode = code;
    }

    // Step 3: Find QR code by uniqueCode
    const qrCode = await QRCode.findOne({ 
      uniqueCode: parsedCode,
      client: role 
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR Code not found for this user role"
      });
    }

    if (qrCode.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `QR Code is ${qrCode.status}`
      });
    }

    // Step 4: Find company user for transaction
    const company = await User.findOne({ role: "company" });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company account not found"
      });
    }

    // Step 5: Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 6: Update QR code status
      qrCode.status = "used";
      qrCode.user = _id;
      qrCode.scannedAt = new Date();
      await qrCode.save({ session });

      // Step 7: Update user wallet
      const amount = parseInt(qrCode.value);
      const oldWallet = user.wallet;
      user.wallet += amount;
      user.lastScannedAt = new Date();
      await user.save({ session });

      // Step 8: Update company wallet (deduct amount)
      company.wallet -= amount;
      await company.save({ session });

      // Step 9: Create transaction record
      const transaction = await transactionx.create([{
        sender: company._id, // Company se amount deduct hua
        receiver: user._id, // User ko amount mila
        amount: amount,
        type: 'scan', // QR scan transaction
        description: `QR Scan - Code: ${parsedCode}, Batch: ${qrCode.batchNumber}`
      }], { session });

      // Step 10: Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Step 11: Send success response
      return res.json({
        success: true,
        message: "QR Code verified successfully",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            wallet: user.wallet,
            oldWallet: oldWallet,
            credited: amount
          },
          qrCode: {
            value: qrCode.value,
            batchNumber: qrCode.batchNumber,
            uniqueCode: qrCode.uniqueCode
          },
          transaction: {
            id: transaction[0]._id,
            amount: transaction[0].amount,
            type: transaction[0].type,
            description: transaction[0].description,
            createdAt: transaction[0].createdAt
          }
        }
      });

    } catch (error) {
      // Rollback if any error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error("QR Verification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during QR Code verification"
    });
  }
};













exports.GETUserQRHist = async (req, res) => {
  console.log( req.params)
  try {
    const { userId } = req.params;

    // Find all QR codes scanned by this user or assigned to this user
    const history = await QRCode.find({
      $or: [{ user: userId } ],
      status: "used",  
    }).sort({ scannedAt: -1 }); 

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get QR code by ID
// @route   GET /api/qrcodes/:id
// @access  Private
exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (qrCode) {
      res.json(qrCode);
    } else {
      res.status(404).json({ message: "QR code not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
