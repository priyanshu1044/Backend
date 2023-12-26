import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        dotenv.config();
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }, ()=>{
            console.log(`Connected to ${DB_NAME} database`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};


export default connectDB;














// (async()=>{
//     try{
//         dotenv.config();
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false,
//             useCreateIndex: true
//         }, ()=>{
//             console.log(`Connected to ${DB_NAME} database`);
//         });

        
//     }
//     catch(error){
//         console.log(error);
//         throw error;
//     }
// })()