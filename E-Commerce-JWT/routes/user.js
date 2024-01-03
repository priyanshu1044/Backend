import { User } from "../models/user.model.js";

import { verifyToken,verifyTokenAndAdmin,verifyTokenAndAuthorization } from "../middleware/verifyToken.js";
import Router from "express";
const router = Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { id,password} = req.params;
  
  if(password){
    password = await bcrypt.hash(password , 8);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});


export default router;
