import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    userId: { 
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
     },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export const Order= mongoose.model("Order", orderSchema);
