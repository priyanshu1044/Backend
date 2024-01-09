import mongoose from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = new mongoose.Schema({
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
  });
  
export const Address = mongoose.model("Address", addressSchema);


const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    addresses: [
      {
        address: {
          type: addressSchema,
          required: true,
        },
      },
    ],
  }, { timestamps: true });
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });
  
  userSchema.methods.isPasswordCorrect = async function (insertedPassword) {
    return await bcrypt.compare(insertedPassword, this.password);
  };
  
  
  
  export const User = mongoose.model("User", userSchema);
  