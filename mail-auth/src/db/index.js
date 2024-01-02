import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
    try {
        dotenv.config();
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Connected to database !! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongoDB connection FAILED",error);
        process.exit(1);
    }
};

export default connectDB;








