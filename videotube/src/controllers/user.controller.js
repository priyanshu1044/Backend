import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

//why we use async in asyncHandler because we are using await in file uploding and it can take some time so we use the async and await

const registerUser = asyncHandler(async (req, res) => {
    // check if user already exists

    //destructuring the req.body
    const { username, email , fullName,password } = req.body;

    //if any of the field is missing then throw an error
    if(!(username && email && fullName && password)){
        throw new ApiError(400,"Please provide all the required fields");
    }

    //find that if this enterd email or username is already exists or not
    const existedUser=await User.findOne({ $or: [{email}, {username}]})

    //if user exists then throw an error
    if(existedUser){
        throw new ApiError(400,"User already exists");
    }

    //multer middleware will add req.files
    //and why we are using ? after req.files because if we don't provide avatar or coverImage then it will throw an error
    const avatarLocalPath=req.files?.avatar[0].path;
    // const coverImageLocalPath=req.files?.coverImage[0].path;
    let coverImageLocalPath;
    // we are checking that if coverImage is an array and it's length is greater than 0 (it means that it has more than one property') then we will assign the path to coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }
    
    // if we don't provide avatar then throw an error because it is mendatory field
    if(!avatarLocalPath){
        throw new ApiError(400,"Please provide an avatar");
    }

    // we are extarcitng the localPath 
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    //here if local path is not found cloudinary return empty string
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){ 
        throw new ApiError(400,"Please provide an avatar");
    }
    

    // create a new user
    const user = await User.create({
        username:username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
    });
    
    // if user is created then i have use the select method to not select the password and refreshToken
    const isUserCreated = await User.findById(user._id).select("-password -refreshToken");
    
    // if user is not created then throw an error
    if(!isUserCreated){
        throw new ApiError(500,"something went wrong while registering user");
    }

    // and if all this shit works send the response that user is successfully created
    return res.status(201).json(
        new ApiResponse(201,isUserCreated,"User registered successfully")
    );
});

export default registerUser;