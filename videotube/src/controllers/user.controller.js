import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

//why we use async in asyncHandler because we are using await in file uploding and it can take some time so we use the async and await

const registerUser = asyncHandler(async (req, res) => {
    // check if user already exists


    const { username, email , fullName,password } = req.body;

    
    if(!(username && email && fullName && password)){
        throw new ApiError(400,"Please provide all the required fields");
    }
    if(email.inclues("@")===false){
        throw new ApiError(400,"Please provide a valid email");
    }
    const existedUser=User.findOne({ $or: [email, username]})
    if(existedUser){
        throw new ApiError(400,"User already exists");
    }
    //multer middleware will add req.files
    //and why we are using ? after req.files because if we don't provide avatar or coverImage then it will throw an error
    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath=req.files?.coverImage[0].path;

    
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Please provide an avatar");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Please provide an avatar");
    }
    
    const user = await User.create({
        username:username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
    });
    
    const isUserCreated = await User.findById(user._id).select("-password -refreshToken");

    if(!isUserCreated){
        throw new ApiError(500,"something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201,isUserCreated,"User registered successfully")
    );
});

export default registerUser;