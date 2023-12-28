import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';


export const verifyJWT =asyncHandler(async (req, res, next) => {

    try {
        // you have question why in the hell req have access of cookie because of cookie-parser in app.js
        const token = req.cookies?.accessToken|| req.headers("Authorization")[1];
        // const token = req.cookies?.accessToken|| req.headers("Authorization")?.replace("Bearer ","");
        if (!token) {
            throw new ApiError(401, "unauthorized request");
        }


        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401,"invalid access Token User not found");
        }
        req.user=user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
});
