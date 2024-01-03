import Router from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


const router=Router()
//REGISTER


//so 
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  
  if(!username && !email && !password){
    return res.status(400).json("all fields are required")
  }

  const encodedPassword = await bcrypt.hash(password, 8);

  const newUser = new User({
    username,
    email,
    password: encodedPassword
  });

  try {
    //wait for the new user to be saved beacuse db in the other continent
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN


router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json("Wrong User Name");
    }

    const isPasswordMatch = await user.isPasswordCorrect(password);

    if (!isPasswordMatch) {
      return res.status(400).json("Invalid email or password");
    }

    // Log the user in or generate a JWT token here (uncomment your code)
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY, 
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    const loggedInUser = await User.findById(user._id).select("-password");

    res.status(200)
      .cookie("accessToken", accessToken, options)
      .json({ user: loggedInUser, accessToken });

  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json("Internal Server Error");
  }
});


export default router

