import { Router } from "express";

import { sendOTPVerificationEmail, signup, login, logout } from "../controllers/user.controller.js";

const router = Router();

router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    try {
      const otp = await sendOTPVerificationEmail(email);
      res.json({ success: true, message: 'OTP sent successfully.', generatedOTP: otp });
    } catch (error) {
      console.error('Error sending OTP: ', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
  });

router.post("/signup", signup);


router.post("/login", login);
router.get("/logout", logout);

export default router;