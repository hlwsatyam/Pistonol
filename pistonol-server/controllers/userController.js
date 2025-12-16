// controllers/userController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../service/emailService");
const moment = require("moment-timezone");

const now = moment().tz("Asia/Kolkata"); // Set timezone to India
const year = now.format("YY"); // Last 2 digits of year
const month = now.format("MM"); // Month with leading zero









// function generateRegistrationPDF(user, password, pdfPath) {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ size: "A4", margin: 50 });
//       doc.pipe(fs.createWriteStream(pdfPath));

//       // ========== HEADER ==========
//       // Logo
//       const logoPath = path.join(__dirname, "../assets/pistonol-logo.png"); // Save logo locally
//       if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, 50, 30, { width: 160 });
//       }

//       // Company Name & Tagline
//       doc.fillColor("#2563eb")
//         .fontSize(20)
//         .text("Pistonol Lubetech Pvt Limited", 220, 40, { align: "left" })
//         .fontSize(10)
//         .fillColor("#555")
//         .text("High-Performance Lubricants • Engineered for Excellence", 220, 65);

//       // Line separator
//       doc.moveTo(50, 100).lineTo(550, 100).strokeColor("#2563eb").lineWidth(2).stroke();

//       // ========== TITLE ==========
//       doc.moveDown(3);
//       doc.fillColor("#0f172a")
//         .fontSize(18)
//         .text("Registration Confirmation", { align: "center", underline: true });
//       doc.moveDown(2);

//       // ========== USER DETAILS ==========
//       doc.fontSize(14).fillColor("#333")
//         .text(`👤 Username: ${user.username}`, { align: "left" })
//         .moveDown(0.5)
//         .text(`📧 Email: ${user.email}`, { align: "left" })
//         .moveDown(0.5)
//         .text(`🔑 Password: ${password}`, { align: "left" });

//       // ========== WELCOME MESSAGE ==========
//       doc.moveDown(2)
//         .fontSize(12)
//         .fillColor("#444")
//         .text(
//           "Dear Partner,\n\nWelcome to Pistonol Lubetech Pvt Limited. We are delighted to have you onboard. Your registration provides you with exclusive access to our corporate resources and premium services.",
//           { align: "justify" }
//         )
//         .moveDown(1)
//         .text("As a registered partner, you will enjoy:", { align: "left" })
//         .list([
//           "Access to real-time product catalog & technical sheets",
//           "Special distributor and dealership programs",
//           "Priority support from our technical team",
//           "Exclusive offers, promotions & loyalty rewards",
//         ]);

//       // ========== TERMS & POLICIES ==========
//       doc.moveDown(2)
//         .fontSize(12)
//         .fillColor("#111")
//         .text("Terms & Policies:", { underline: true })
//         .moveDown(0.5)
//         .fontSize(10)
//         .fillColor("#444")
//         .list([
//           "Your credentials are confidential and should not be shared.",
//           "Access is strictly limited to registered partners.",
//           "PISTONOL reserves the right to modify terms at any time.",
//           "For detailed policies, visit: https://pistonol.com/policies",
//         ]);

//       // ========== FOOTER ==========
//       doc.moveDown(4);
//       doc.moveTo(50, 720).lineTo(550, 720).strokeColor("#2563eb").lineWidth(1).stroke();

//       doc.fontSize(9).fillColor("#666")
//         .text("Pistonol Lubetech Pvt Limited | Corporate Office: Mumbai, India", { align: "center" })
//         .moveDown(0.3)
//         .text("🌐 www.pistonol.com | ✉ support@pistonol.com | ☎ +91-9876543210", { align: "center" })
//         .moveDown(0.3)
//         .text("This document is auto-generated and does not require a signature.", { align: "center", italics: true });

//       doc.end();
//       resolve();
//     } catch (err) {
//       reject(err);
//     }
//   });
// }








 
// exports.registerUser = async (req, res) => {
//   try {
//     const { mobile, role, password } = req.body;

//     // Check required fields
//     if (!mobile || !role || !password) {
//       return res.status(400).json({
//         message: "Mobile, role and password are required",
//       });
//     }

//     // Generate username based on role
//     let username;

//     if (role === "distributor") {
//       // Find the last distributor count
//       const lastDistributor = await User.findOne({ role: "distributor" })
//         .sort({ createdAt: -1 })
//         .select("username");

//       let count = 1;
//       if (lastDistributor && lastDistributor.username.startsWith("DIST")) {
//         const parts = lastDistributor.username.split("-");
//         count = parseInt(parts[parts.length - 1]) + 1;
//       }

//       username = `DIST-${year}${month}-${count.toString().padStart(4, "0")}`;
//     } else if (role === "company-employee") {
//       // Find the last employee count
//       const lastEmployee = await User.findOne({ role: "company-employee" })
//         .sort({ createdAt: -1 })
//         .select("username");

//       let count = 1;
//       if (lastEmployee && lastEmployee.username.startsWith("EMP")) {
//         const parts = lastEmployee.username.split("-");
//         count = parseInt(parts[parts.length - 1]) + 1;
//       }

//       username = `EMP-${year}${month}-${count.toString().padStart(4, "0")}`;
//     }

//     // Check if user exists
//     const userExists = await User.findOne({ $or: [{ username }, { mobile }] });
//     if (userExists) {
//       return res.status(400).json({
//         message: "User with this username or mobile already exists",
//       });
//     }
//     console.log(req.body);
//     // Create user data
//     const userData = {
//       username,
//       mobile,
//       role,
//       password,
//       // Optional fields
//       ...(req.body.name && { name: req.body.name }),
//       ...(req.body.email && { email: req.body.email }),
//       ...(req.body.panNumber && { panNumber: req.body.panNumber }),
//       ...(req.body.aadhaarNumber && { aadhaarNumber: req.body.aadhaarNumber }),
//       ...(req.body.address && { address: req.body.address }),
//       ...(req.body.businessPan && { businessPan: req.body.businessPan }),
//       ...(req.body.businessType && { businessType: req.body.businessType }),
//       ...(req.body.businessName && { businessName: req.body.businessName }),
//       ...(req.body.state && { state: req.body.state }),
//       ...(req.body.district && { district: req.body.district }),
//       ...(req.body.pincode && { pincode: req.body.pincode }),
//       ...(req.body.photo && { photo: req.body.photo }),
//     };

//     const user = await User.create(userData);

//     // Generate PDF
//     const pdfDoc = new PDFDocument();
//      const pdfPath = path.join(__dirname, "..", "temp", `${username}.pdf`);
//     await generateRegistrationPDF(user, password, pdfPath);
//     pdfDoc.pipe(fs.createWriteStream(pdfPath));

//     pdfDoc.fontSize(20).text("User Registration Details", { align: "center" });
//     pdfDoc.moveDown();

//     pdfDoc.fontSize(14).text(`Username: ${user.username}`);
//     pdfDoc.text(`Name: ${user.name || "Not provided"}`);
//     pdfDoc.text(`Mobile: ${user.mobile}`);
//     pdfDoc.text(`Role: ${user.role}`);
//     pdfDoc.text(`Email: ${user.email || "Not provided"}`);
//     pdfDoc.text(`Business Name: ${user.businessName || "Not provided"}`);
//     pdfDoc.text(`Business Type: ${user.businessType || "Not provided"}`);

//     pdfDoc.end();
  
 
//     // Send email with PDF if email is provided
//     if (user.email) {
//       await new Promise((resolve, reject) => {
//         pdfDoc.on("end", async () => {
//           try {
        
 


//             const mailOptions = {
//   from: `"Pistonol Lubetech Pvt Limited" <${process.env.MAIL_USER}>`,
//   to: user.email,
//   subject: "Welcome to Pistonol Lubetech Pvt Limited – Your Registration is Successful ✅",
//   html: `
//   <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background:#f4f6f9; padding:20px;">
//     <div style="max-width:650px; margin:auto; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
      
//       <!-- Header -->
//       <div style="background:linear-gradient(135deg,#1e293b,#2563eb); padding:25px; text-align:center; color:white;">
//         <img src="https://pistonol.com/wp-content/uploads/2023/04/Pistonol-letter-Logo-3D-effect-1000x298.png" alt="Logo" style="width:25px;  height:25px;  margin-bottom:10px;">
//         <h2 style="margin:0;">Pistonol Lubetech Pvt Limited</h2>
//         <p style="margin:0; font-size:13px; opacity:0.9;">High-Performance Lubricants • Engineered for Excellence</p>
//       </div>

//       <!-- Body -->
//       <div style="padding:30px; color:#333;">
//         <h3 style="color:#0f172a;">Hello <span style="color:#2563eb;">${user.username}</span>,</h3>
//         <p style="font-size:15px; line-height:1.6;">
//           🚀 Welcome to <strong>Pistonol Lubetech Pvt Limited</strong>!  
//           We are excited to have you onboard. Your account has been successfully registered and is now ready to use.  
//         </p>

//         <div style="margin:20px 0; padding:20px; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb;">
//           <p style="margin:0; font-size:15px;">👤 <strong>Username:</strong> ${user.username}</p>
//           <p style="margin:8px 0 0; font-size:15px;">🔑 <strong>Password:</strong> ${password}</p>
//           <p style="margin:8px 0 0; font-size:15px;">📧 <strong>Email:</strong> ${user.email}</p>
//         </div>

//         <p style="font-size:14px; line-height:1.6;">
//           As a valued member of our network, you will get:  
//           ✅ Access to latest product updates  
//           ✅ Priority technical support  
//           ✅ Exclusive offers for distributors and partners  
//         </p>

//         <div style="margin-top:25px; text-align:center;">
//           <a href="https://pistonollubricants.com" style="background:#2563eb; color:#fff; padding:12px 26px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
//             🌐 Visit Your Dashboard
//           </a>
//         </div>
//       </div>

//       <!-- Footer -->
//       <div style="background:#f1f5f9; padding:20px; text-align:center; font-size:12px; color:#64748b;">
//         <p style="margin:0;">📞 +91-98765-43210 | ✉️ support@pistonollubricants.com</p>
//         <p style="margin:5px 0 0;">© ${new Date().getFullYear()} Pistonol Lubetech Pvt Limited. All rights reserved.</p>
//       </div>
//     </div>
//   </div>
//   `,
//   attachments: [
//     {
//       filename: `${user.username}_registration.pdf`,
//       path: pdfPath,
//       contentType: "application/pdf",
//     },
//   ],
// };































//             await sendEmail(mailOptions);
//             resolve();
//           } catch (error) {
//             console.error("Email sending error:", error);
//             reject(error);
//           } finally {
//             // Delete the temporary PDF file
//             fs.unlink(pdfPath, (err) => {
//               if (err) console.error("Error deleting PDF:", err);
//             });
//           }
//         });
//       });
//     }

//     res.status(201).json({
//       _id: user._id,
//       username: user.username,
//       mobile: user.mobile,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({
//       message: error.message || "Server error during registration",
//     });
//   }
// };




function genxerateRegistrationPDF(user, password, pdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Track y-position and page breaks
      let yPosition = 50;

      // ========== HEADER ==========
      // Logo
      const logoPath = path.join(__dirname, "..", "temp", `logo.png`);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, yPosition, { width: 160 });
      }

      // Company Name & Tagline
      doc.fillColor("#2563eb")
        .fontSize(20)
        .text("Pistonol Lubetech Pvt Limited", 220, yPosition + 10, { align: "left" })
        .fontSize(10)
        .fillColor("#555")
        .text("High-Performance Lubricants • Engineered for Excellence", 220, yPosition + 35);

      // Line separator
      yPosition = 100;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor("#2563eb").lineWidth(2).stroke();

      // ========== TITLE ==========
      yPosition += 30;
      doc.fillColor("#0f172a")
        .fontSize(18)
        .text("Registration Confirmation", 50, yPosition, { align: "center", underline: true });
      
      yPosition += 40;

      // ========== USER DETAILS ==========
      doc.fontSize(12).fillColor("#333")
        .text(`Username: ${user.username}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Email: ${user.email || "Not provided"}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Mobile: ${user.mobile}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Password: ${password}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Role: ${user.role}`, 50, yPosition);
      yPosition += 30;

      // Check if we need a new page
   
      // Personal Information Section
      doc.fontSize(14).fillColor("#1e293b")
        .text("Personal Information", 50, yPosition, { underline: true });
      yPosition += 25;
      
      doc.fontSize(11).fillColor("#333")
        .text(`Name: ${user.name || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`PAN: ${user.panNumber || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`Aadhaar: ${user.aadhaarNumber || "Not provided"}`, 50, yPosition);
      yPosition += 30;

 
 

      // Address Information
      doc.fontSize(14).fillColor("#1e293b")
        .text("Address Details", 50, yPosition, { underline: true });
      yPosition += 25;
      
      doc.fontSize(11).fillColor("#333")
        .text(`Address: ${user.address || "Not provided"}`, 50, yPosition, { width: 500 });
      yPosition += 20;
      
      doc.text(`State: ${user.state || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`District: ${user.district || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`Pincode: ${user.pincode || "Not provided"}`, 50, yPosition);
      yPosition += 30;

      // Check if we need a new page
     
      // ========== WELCOME MESSAGE ==========
      doc.fontSize(12).fillColor("#444")
        .text("Dear Partner,", 50, yPosition);
      yPosition += 20;
      
      doc.text("Welcome to Pistonol Lubetech Pvt Limited. We are delighted to have you onboard. Your registration provides you with exclusive access to our corporate resources and premium services.", 50, yPosition, { width: 500, align: "justify" });
      yPosition += 40;
      
      doc.text("As a registered partner, you will enjoy:", 50, yPosition);
      yPosition += 20;

      // Benefits list
      

      // ========== TERMS & POLICIES ==========
     

      // ========== CONTACT INFORMATION ==========
      doc.fontSize(12).fillColor("#111")
        .text("Need Help?", 50, yPosition, { underline: true });
      yPosition += 25;

      const contacts = [
        "Technical Support: support@pistonol.com | +91-9876543210",
        "Sales Inquiries: sales@pistonol.com | +91-9876543211",
        "Emergency Contact: available 24/7 for critical issues",
        "Regional Office: Contact details based on your location"
      ];

      contacts.forEach(contact => {
       
        doc.fontSize(10).fillColor("#444")
          .text(`• ${contact}`, 60, yPosition, { width: 490 });
        yPosition += 15;
      });

      // ========== FOOTER ==========
      // Always add footer on the last page
      const footerY = 750;
      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor("#2563eb").lineWidth(1).stroke();

 
      doc.end();
      
      stream.on('finish', () => {
        resolve();
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}



 async function generateRegistrationPDF(user, password, pdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Background image path
      const backgroundPath = path.join(__dirname, "..", "temp", "letter.png");
      
      // Function to add background to current page
      const addBackground = () => {
        if (fs.existsSync(backgroundPath)) {
          // Add background with low opacity for watermark effect
          doc.save()
             .opacity(50) // Light watermark effect (10% opacity)
             .image(backgroundPath, 0, 0, {
               width: doc.page.width,
               height: doc.page.height
             })
             .restore();
        }
      };

      // Add background to first page
      addBackground();

      // Track y-position
      let yPosition = 50;

      // ========== HEADER ==========
      // Logo
      const logoPath = path.join(__dirname, "..", "temp", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, yPosition, { width: 160 });
      }

      // Company Name & Tagline
      doc.fillColor("#2563eb")
        .fontSize(20)
        .text("Pistonol Lubetech Pvt Limited", 220, yPosition + 10, { align: "left" })
        .fontSize(10)
        .fillColor("#555")
        .text("Engine Oil • Engineered for Excellence", 220, yPosition + 35);

      // Line separator
      yPosition = 100;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor("#2563eb").lineWidth(2).stroke();

      // ========== TITLE ==========
      yPosition += 30;
      doc.fillColor("#0f172a")
        .fontSize(18)
        .text("Registration Confirmation", 50, yPosition, { align: "center", underline: true });
      
      yPosition += 40;

      // ========== USER DETAILS ==========
      doc.fontSize(12).fillColor("#333")
        .text(`Username: ${user.username}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Email: ${user.email || "Not provided"}`, 50, yPosition);
      yPosition += 20;
      
      doc.text(`Mobile: ${user.mobile}`, 50, yPosition);
      yPosition += 20;
      
  
      
      doc.text(`Role: ${user.role}`, 50, yPosition);
      yPosition += 30;

      // Personal Information Section
      doc.fontSize(14).fillColor("#1e293b")
        .text("Personal Information", 50, yPosition, { underline: true });
      yPosition += 25;
      
      doc.fontSize(11).fillColor("#333")
        .text(`Name: ${user.name || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`PAN: ${user.panNumber || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`Aadhaar: ${user.aadhaarNumber || "Not provided"}`, 50, yPosition);
      yPosition += 30;

      // Business Information
      if (user.businessName || user.businessType || user.businessPan) {
        doc.fontSize(14).fillColor("#1e293b")
          .text("Business Information", 50, yPosition, { underline: true });
        yPosition += 25;
        
        if (user.businessName) {
          doc.fontSize(11).fillColor("#333")
            .text(`Business Name: ${user.businessName}`, 50, yPosition);
          yPosition += 15;
        }
        
        if (user.businessType) {
          doc.text(`Business Type: ${user.businessType}`, 50, yPosition);
          yPosition += 15;
        }
        
        if (user.businessPan) {
          doc.text(`Business PAN: ${user.businessPan}`, 50, yPosition);
          yPosition += 15;
        }
        
        yPosition += 15;
      }

      // Address Information
      doc.fontSize(14).fillColor("#1e293b")
        .text("Address Details", 50, yPosition, { underline: true });
      yPosition += 25;
      
      doc.fontSize(11).fillColor("#333")
        .text(`Address: ${user.address || "Not provided"}`, 50, yPosition, { width: 500 });
      yPosition += (user.address && user.address.length > 50) ? 30 : 20;
      
      doc.text(`State: ${user.state || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`District: ${user.district || "Not provided"}`, 50, yPosition);
      yPosition += 15;
      
      doc.text(`Pincode: ${user.pincode || "Not provided"}`, 50, yPosition);
      yPosition += 30;

      // Check if we need a new page
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
        // Add background to new page
        addBackground();
      }

      // ========== WELCOME MESSAGE ==========
      doc.fontSize(12).fillColor("#444")
        .text("Dear Team,", 50, yPosition);
      yPosition += 20;
      
      doc.text("Welcome to Pistonol Lubetech Pvt Limited. We are delighted to have you onboard. Your registration provides you with exclusive access to our corporate resources and premium services.", 50, yPosition, { width: 500, align: "justify" });
      yPosition += 40;
      
      doc.text("As a registered partner, you will enjoy:", 50, yPosition);
      yPosition += 20;

      // Benefits list
      const benefits = [
        "Access to premium product catalog",
        "Priority technical support",
    
        "Marketing materials and support",
        "Network opportunities"
      ];

      benefits.forEach(benefit => {
        doc.fontSize(10).fillColor("#444")
          .text(`✓ ${benefit}`, 60, yPosition);
        yPosition += 15;
      });

      yPosition += 20;

   

      // Check if we need another page
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
        // Add background to new page
        addBackground();
      }

      // ========== CONTACT INFORMATION ==========
      doc.fontSize(12).fillColor("#111")
        .text("Need Help?", 50, yPosition, { underline: true });
      yPosition += 25;

      const contacts = [
        "Technical Support: career.hr@pistonol.com | +91-9122926523",
      
   
      ];

      contacts.forEach(contact => {
        doc.fontSize(10).fillColor("#444")
          .text(`• ${contact}`, 60, yPosition, { width: 490 });
        yPosition += 15;
      });
 
      yPosition += 20;

      // ========== FOOTER ==========
      const footerY = Math.min(yPosition, 750);
      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor("#2563eb").lineWidth(1).stroke();

 
      doc.end();
      
      stream.on('finish', () => {
        resolve();
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
 
 

 


exports.registerUser = async (req, res) => {
  try {
    const { mobile, role, password } = req.body;
 console.log(req.body)
 
    // Check required fields
    if (!mobile || !role || !password) {
      return res.status(400).json({
        message: "Mobile, role and password are required",
      });
    }


    // Generate username based on role
    let username;

    if (role === "distributor") {
      // Find the last distributor count
      const lastDistributor = await User.findOne({ role: "distributor" })
        .sort({ createdAt: -1 })
        .select("username");

      let count = 1;
      if (lastDistributor && lastDistributor.username.startsWith("DIST")) {
        const parts = lastDistributor.username.split("-");
        count = parseInt(parts[parts.length - 1]) + 1;
      }

      username = `DIST-${year}${month}-${count.toString().padStart(4, "0")}`;
    }
    if (role === "dealer") {
      // Find the last distributor count
      const lastDistributor = await User.findOne({ role: "dealer" })
        .sort({ createdAt: -1 })
        .select("username");

      let count = 1;
      if (lastDistributor && lastDistributor.username.startsWith("DEAL")) {
        const parts = lastDistributor.username.split("-");
        count = parseInt(parts[parts.length - 1]) + 1;
      }

      username = `DEAL-${year}${month}-${count.toString().padStart(4, "0")}`;
    }
    if (role === "mechanic") {
      // Find the last distributor count
      const lastDistributor = await User.findOne({ role: "mechanic" })
        .sort({ createdAt: -1 })
        .select("username");

      let count = 1;
      if (lastDistributor && lastDistributor.username.startsWith("MECH")) {
        const parts = lastDistributor.username.split("-");
        count = parseInt(parts[parts.length - 1]) + 1;
      }

      username = `MECH-${year}${month}-${count.toString().padStart(4, "0")}`;
    }
     
    
    
    
    
    
    
    
    
    
    
    else if (role === "company-employee") {
      // Find the last employee count
      const lastEmployee = await User.findOne({ role: "company-employee" })
        .sort({ createdAt: -1 })
        .select("username");

      let count = 1;
      if (lastEmployee && lastEmployee.username.startsWith("EMP")) {
        const parts = lastEmployee.username.split("-");
        count = parseInt(parts[parts.length - 1]) + 1;
      }

      username = `EMP-${year}${month}-${count.toString().padStart(4, "0")}`;
     
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ username }, { mobile }] });
    if (userExists) {
      return res.status(400).json({
        message: "User with this username or mobile already exists",
      });
    }

    // Create user data
    const userData = {
      username,
      mobile,
      role,
      isVerify:true,
      password,
      // Optional fields
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.panNumber && { panNumber: req.body.panNumber }),
      ...(req.body.aadhaarNumber && { aadhaarNumber: req.body.aadhaarNumber }),
      ...(req.body.address && { address: req.body.address }),
      ...(req.body.businessPan && { businessPan: req.body.businessPan }),
      ...(req.body.businessType && { businessType: req.body.businessType }),
      ...(req.body.businessName && { businessName: req.body.businessName }),
      ...(req.body.state && { state: req.body.state }),
      ...(req.body.district && { district: req.body.district }),
      ...(req.body.pincode && { pincode: req.body.pincode }),
      ...(req.body.photo && { photo: req.body.photo }),
    };

    const user = await User.create(userData);

    // Generate PDF
    const pdfPath = path.join(__dirname, "..", "temp", `${username}.pdf`);
    await generateRegistrationPDF(user, password, pdfPath);

    // Send email with PDF if email is provided
    if (user.email) {
      try {





















            const mailOptions = {
  from: `"Pistonol Lubetech Pvt Limited" <${process.env.MAIL_USER}>`,
  to: user.email,
  subject: "Welcome to Pistonol Lubetech Pvt Limited – Your Registration is Successful ✅",
  html: `
  <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background:#f4f6f9; padding:20px;">
    <div style="max-width:650px; margin:auto; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e293b,#2563eb); padding:25px; text-align:center; color:white;">
        <img src="https://pistonol.com/wp-content/uploads/2023/04/Pistonol-letter-Logo-3D-effect-1000x298.png" alt="Logo" style="width:100px;  height:50px;  margin-bottom:10px;">
        <h2 style="margin:0;">Pistonol Lubetech Pvt Limited</h2>
        <p style="margin:0; font-size:13px; opacity:0.9;">High-Performance Lubricants • Engineered for Excellence</p>
      </div>

      <!-- Body -->
      <div style="padding:30px; color:#333;">
        <h3 style="color:#0f172a;">Hello <span style="color:#2563eb;">${user.username}</span>,</h3>
        <p style="font-size:15px; line-height:1.6;">
          🚀 Welcome to <strong>Pistonol Lubetech Pvt Limited</strong>!  
          We are excited to have you onboard. Your account has been successfully registered and is now ready to use.  
        </p>

        <div style="margin:20px 0; padding:20px; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb;">
          <p style="margin:0; font-size:15px;">👤 <strong>Username:</strong> ${user.username}</p>
         
          <p style="margin:8px 0 0; font-size:15px;">📧 <strong>Email:</strong> ${user.email}</p>
        </div>

        <p style="font-size:14px; line-height:1.6;">
          As a valued member of our network, you will get:  
          ✅ Access to latest product updates  
          ✅ Priority technical support  
          ✅ Exclusive offers for distributors and partners  
        </p>

      
        <div style="margin-top:25px; text-align:center;">
          <a href="https://play.google.com/store/apps/details?id=com.pistonol" style="background:#2563eb; color:#fff; padding:12px 26px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            ✅Download APK
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f1f5f9; padding:20px; text-align:center; font-size:12px; color:#64748b;">
        <p style="margin:0;">📞 +91-98765-43210 | ✉️ pistonol@rediffmail.com</p>
        <p style="margin:5px 0 0;">© ${new Date().getFullYear()} Pistonol Lubetech Pvt Limited. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
  attachments: [
    {
      filename: `${user.username}_registration.pdf`,
      path: pdfPath,
      contentType: "application/pdf",
    },
  ],
};

 


        await sendEmail(mailOptions);
      } catch (error) {
        console.error("Email sending error:", error);
      }  
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
};











exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res
        .status(400)
        .json({ message: "Valid mobile number is required" });
    }

    // Generate a 6-digit OTP
    const otp = 123456;
    // Save or update OTP in DB (you can save in User or a separate OTP model)
    let user = await User.findOne({ mobile });

    if (!user) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000); // Generates 5-digit number
      const username = `pistonol-${randomDigits}`;

      user = await User.create({
        mobile,
        username,
      });
    }

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP via SMS
    // await sendSms(mobile, `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent successfully", mobile });
  } catch (error) {
    console.error("OTP send error:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error while sending OTP" });
  }
};
exports.verify = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validate inputs
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res
        .status(400)
        .json({ message: "Valid mobile number is required" });
    }

    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ message: "Valid 6-digit OTP is required" });
    }

    // Find user
    const user = await User.findOne({ mobile });

    if (!user) {
      let username;

      const lastEmployee = await User.findOne({ role: "customer" })
        .sort({ createdAt: -1 })
        .select("username");

      let count = 1;
      if (lastEmployee && lastEmployee.username.startsWith("CUS")) {
        const parts = lastEmployee.username.split("-");
        count = parseInt(parts[parts.length - 1]) + 1;
      }

      username = `CUS-${year}${month}-${count.toString().padStart(4, "0")}`;

      const newUser = new User({
        username,
        mobile,
        isVerify: true,
        role: "customer",
        password: otp,
      });

     const sss= await newUser.save();
      return res.status(200).json({
        message: "Account Created successfully!",
        user:sss,
      });
    }
    if (!user.isVerify) {
      return res.status(403).json({
        message: "Account Unverifed!",

        user,
      });
    }

    // You can now issue a token or move to next step (e.g., profile setup)
    return res.status(200).json({
      message: "Logged successfully",

      user,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: error.message || "Server error during OTP verification",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = {
      ...(req.body.username && { username: req.body.username }),
      ...(req.body.mobile && { mobile: req.body.mobile }),
      ...(req.body.role && { role: req.body.role }),
      // Optional fields
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.panNumber && { panNumber: req.body.panNumber }),
      ...(req.body.aadhaarNumber && { aadhaarNumber: req.body.aadhaarNumber }),
      ...(req.body.address && { address: req.body.address }),
      ...(req.body.state && { state: req.body.state }),
      ...(req.body.district && { district: req.body.district }),
      ...(req.body.pincode && { pincode: req.body.pincode }),
      ...(req.body.photo && { photo: req.body.photo }),
    };

    const user = await User.findByIdAndUpdate(userId, userData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: error.message || "Server error during update",
    });
  }
};
exports.profile = async (req, res) => {
  try {
    const { _id } = req.body;
    console.log(req.body);
    const user = await User.findByIdAndUpdate(_id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: error.message || "Server error during update",
    });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.find({ role });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.statusChange = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = [
      "distributor",
      "dealer",
      "mechanic",
      "company-employee",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }
    const x = await User.findById(req.params.id);

    if (x.role !== role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        isVerify: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Verification successful",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.passChange = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Update user password
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: newPassword },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Password changed successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.role = req.body.role || user.role;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
        wallet: updatedUser.wallet,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
