import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({

    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,
        required:true,

    },
    coverImage:{
        type:String,
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
    },
    refreshToken:{
        type:String,
    },


},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,12);
    next();
});

userSchema.methods.comparePassword = async function(insertedPassword){
    return await bcrypt.compare(insertedPassword,this.password);
};


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({id:this._id},
        process.env.REFRESH_TOKEN_SECRET,
        {  
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
}
export const User = mongoose.model("User",userSchema);