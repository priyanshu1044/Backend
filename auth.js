const nodemailer = require('nodemailer');

// Email configuration for Outlook/Hotmail
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@hotmail.com',
    pass: 'your-email-password',
  },
});

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Controller to send OTP verification email
const sendOTPVerificationEmail = async (email) => {
  try {
    // Generate OTP
    const otp = generateOTP();

    // Email options
    const mailOptions = {
      from: 'your-email@hotmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for verification is: ${otp}`,
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    // Log the result (you can handle it based on your application requirements)
    console.log('Email sent: ', result);

    return otp; // Return the generated OTP for verification on the server
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

module.exports = {
  sendOTPVerificationEmail,
};




export  const sendOTPVerificationEmail = async (email) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            // host: 'smtp-mail.outlook.com',
            port: 587,
            secure: true, // true for 465, false for other ports
            auth: {
              user: 'otpgen10@gmail.com',
              pass: `${process.env.EMAIL_PASSWORD}`,
            },
          });
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000);
  
      // Email options
      const mailOptions = {
        from: 'otpgen10@hotmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}`,
      };
  
      // Send email
      const result = await transporter.sendMail(mailOptions);
  
      // Log the result (you can handle it based on your application requirements)
      console.log('Email sent: ', result);
  
      return otp; // Return the generated OTP for verification on the server
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  };

