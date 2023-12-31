import {User}  from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
    // genrate access token
    // genrate refresh token
    // save refresh token in database
    // return access token and refresh token

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        //this refresh token is complete genrated encoded token
        //and we saved that token in user 
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while genrating access and refresh token");
    }
}

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


const loginUser = asyncHandler(async (req, res) => {
    // validation of input fields (req.body such as email or username and password)
    // check if user is present in database
    // compare password using JWT and databse
    // genrate access Token and refreshToken 
    // send cookie
    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Check if user exists in the database

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
    // Generate access token and refresh token

    const {accessToken, refreshToken} = await genrateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )


});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:undefined}},{new:true});

    const options={
        httpOnly:true,
        secure:true,
    };

    return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully"));

});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken= req.cookies.refreshToken||req.body.refreshToken


    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }


    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
        const user= User.findById(decodedToken._id)
        if(!user){
            throw new ApiError(401,"unauthorized request");
        }
    
    
        //if you reach at line number 190 that means user is present in database and refresh token is also valid
    
        //and now we have 2 type of token one is incomingRefreshToken token and another is refresh token
     
    
        //now we will check that if incomingRefreshToken is same as decoded user has refresh token at line numeber 187
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used"); 
        }
    
        const options={
            httpOnly:true,
            secure:true,
        };
        
        const {accessToken,newRefreshToken}=await genrateAccessAndRefreshToken(user._id)
    
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Token refreshed successfully"));
    
    } catch (error) {
        throw new ApiError(401,erroe?.message||"invalid refreshtoken");
    }
})


const changeCurrentPassword =asyncHandler(async (req, res) => {
    const {oldPassword,newPassword}=req.body;

    // if(newPassword!==confirmPassword){
    //     throw new ApiError(400,"Password and confirm password does not match");
    // }
    
    const user =await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid old password");
    }


    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));


})


const getCurrentUser = asyncHandler(async (req, res) => {

    const user=req.user;

    res.status(200).json(new ApiResponse(200,user,"CurrentUser fetched successfully"));

}) 


const updateAccountDetails = asyncHandler(async (req, res) => {
    
        const {fullName,email}=req.body;
    
        if(!fullName || !email){
            throw new ApiError(400,"Please provide all the required fields");
        }
        //we use new:true because it returns the updated information
        const user=await User.findByIdAndUpdate(req.user._id,{$set:{fullName,email}},{new:true}).select("-password");
        res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"));
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath=req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){ 
        throw new ApiError(400,"Error while uploading avatar");
    }
    //we use new:true because it returns the updated information
    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatar.url}},{new:true}).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"));

})


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath =req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is missing");
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){ 
        throw new ApiError(400,"Error while uploading coverImage");
    }
    //we use new:true because it returns the updated information
    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}},{new:true}).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"coverImage updated successfully"));
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username}=req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username is required");
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscribersCount:{$size:"$subscribers"},
                channelsSubscribedToCount:{$size:"$subscribedTo"},
                isSubscribed:{
                    $cond:{
                        if:{$eq:[{$size:"$subscribers"},0]},
                        then:false,
                        else:{
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        }
                    }
                }

            }
        },{
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,   
                email:1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel not exists");
    }


    return res.status(200).
    json(new ApiResponse(200,channel[0],"Channel fetched successfully"));

})

const getWatchHistory = asyncHandler(async (req, res) => {
    
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
};