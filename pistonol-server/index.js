const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');
const morgan = require('morgan');

  dotenv.config();
const app = express();
app.use(express.json()); 
app.use(cookieParser());
app.use(morgan('dev'));
 
 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/generated_qrcodes', express.static(path.join(__dirname, 'generated_qrcodes')));
app.use(
  cors()
);








const multer = require("multer");
 
 

// Storage config (store images in "uploads" folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder name
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // unique file name
  }
});

const upload = multer({ storage });




// Upload image route
app.post("/api/upload-image", upload.single("image"), (req, res) => {
  console.log(req.file)
   console.log(req.files)
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
 
    // Return file URL (assuming you're serving /uploads statically)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    res.status(200).json({ message: "Upload successful", imageUrl });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});














app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  connectDB();
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customer", require("./routes/customer.js"));
app.use("/api/leads", require("./routes/leadRoutes.js"));
app.use("/api/qrcodes", require("./routes/qrCodeRoutes"));
app.use("/api/v1/stores", require("./routes/Store.js"));
app.use("/api/v1/update/stores", require("./routes/storeUpdate.js"));
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');

app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);

const attendanceRoutess = require('./routes/admin/attendance.js');
const leaveRoutess = require('./routes/admin/leave.js');


app.use('/api/admin/attendance', attendanceRoutess);
app.use('/api/admin/leaves', leaveRoutess); 

app.get('/', (req, res) => res.send("dgdfgdfgd"));

const dmrRoutes = require('./routes/dmr');
app.use('/api/dmr', dmrRoutes);

app.use("/api/analytics", require("./routes/analyticsRoutes.js"));
app.use("/api/wallet", require("./routes/walletRoutes.js"));
app.use("/api/products", require("./routes/productRoutes.js"));
app.use("/api/marquees" , require("./routes/marquee.js"));
app.use("/api/banners" , require("./routes/banner.js"));

app.use("/api/targets" , require("./routes//targets.js"));
app.use("/api/transactions" , require("./routes/transfer.js"));
app.use("/api/orders" , require("./routes/orders.js"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
