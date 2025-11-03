const nodemailer = require("nodemailer");
 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { 
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify().then(s=>console.log("mail conn")).catch(e=>console.log(e))
/**
 * @param {Object} mailOptions
 * @returns {Object}
 */








    








const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;