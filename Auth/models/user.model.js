const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String ,required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    token: { type: String },
},{timestamps: true});


export const User = mongoose.model('User', userSchema);