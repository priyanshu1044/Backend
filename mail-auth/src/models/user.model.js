import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    otp: Number,
},{
    timestamps: true,
});

userSchema.methods.isPasswordCorrect  = async function(insertedPassword){
    return await bcrypt.compare(insertedPassword,this.password);
};


export const User = mongoose.model("User", userSchema);