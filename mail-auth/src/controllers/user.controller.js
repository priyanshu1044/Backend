import {User} from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';



// Email configuration

// Controller to send OTP verification email
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
        from: 'otpgen10@gmail.com',
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
  

export const signup = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!(username && email && password)) {
      throw new ApiError(400, 'Please provide all the required fields');
    }
  
    const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  
    if (existedUser) {
      throw new ApiError(400, 'User already exists');
    }
  
    // Save the OTP in the user document (you may want to hash it)
    const myEncPassword = await bcrypt.hash(password, 8);
  
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password: myEncPassword,
      otp: await sendOTPVerificationEmail(email),
    });
  
    // Send OTP via email
  
    return res
      .status(201)
      .json(new ApiResponse(201, user, 'User registered successfully. OTP sent to your email.'));
  });


  
  
  export const login = asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body;
  
    if (!(email && password && otp)) {
      throw new ApiError(400, 'Please provide all the required fields');
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new ApiError(400, 'Invalid email or password');
    }
  
    // Check if the provided OTP matches the stored OTP
    if (user.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }
  
    const isPasswordMatch = await user.isPasswordCorrect(password);
  
    if (!isPasswordMatch) {
      throw new ApiError(400, 'Invalid email or password');
    }
  
    // Clear the OTP after successful login
    user.otp = null;
    await user.save();
  
    return res.status(200).json(new ApiResponse(200, {}, 'Login successful'));
  });
  
  export const logout = (req, res) => {
  };
  