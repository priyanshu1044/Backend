import dotenv from "dotenv";

// Load environment variables
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});

connectDB()