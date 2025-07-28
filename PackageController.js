const CustomPackage = require('../models/CustomPackage');
const nodemailer = require('nodemailer');

const submitCustomPackage = async (req, res) => {
  const { userEmail, packageDetails } = req.body;

  if (!userEmail || !packageDetails) {
    return res.status(400).json({ message: "User email and package details are required." });
  }

  try {
    // Save to DB
    const newPackage = new CustomPackage({ userEmail, packageDetails });
    await newPackage.save();

    // Send confirmation email to user
    // Setup nodemailer transporter (configure with your SMTP/email credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // example: Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Custom Package Submission',
      text: `Thank you for submitting your custom package.\nDetails:\n${JSON.stringify(packageDetails, null, 2)}`
    };

    await transporter.sendMail(mailOptions);

    // Respond success
    res.status(201).json({ message: "Custom package submitted and email sent." });

    // TODO: You can also send packageDetails to chatbot input here

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitCustomPackage };
