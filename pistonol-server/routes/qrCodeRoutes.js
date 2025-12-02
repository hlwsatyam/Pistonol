const express = require("express");
const {
  generateQRCodes,
  getQRCodes,
  deleteQRCode,
  getQRCodeById,
  updateQRCode,
  verifyQRCodes,
  GETUserQRHist,
} = require("../controllers/qrCodeController");
const User = require("../models/User");
const QRCode = require("../models/QRCode");
const router = express.Router();


router.post('/generate-user-qr', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create QR data
    const qrData =JSON.stringify( {
      userId: user._id,
      username: user.username,
      name: user?.name || "Pistonol Team",
      role: user?.role,
      timestamp: new Date().toISOString(),
      type: 'user_verification'
    });

    // Generate QR code as base64
  // await QRCode.toDataURL(JSON.stringify(qrData));


   const qrCodeDataURL =await require("qrcode").toDataURL(qrData );

 


    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      userData: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});



router.route("/").post(generateQRCodes).get(getQRCodes);
router.post("/verification", verifyQRCodes);

// In your backend routes
router.get("/history/:userId", GETUserQRHist);

router.route("/:id").delete(deleteQRCode).get(getQRCodeById).put(updateQRCode);

module.exports = router;
