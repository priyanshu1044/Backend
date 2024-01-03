import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.methods.isPasswordCorrect  = async function(insertedPassword){
  return await bcrypt.compare(insertedPassword,this.password);
};

export const User= mongoose.model("User", UserSchema);
