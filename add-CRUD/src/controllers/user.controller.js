import {User,Address}  from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(new ApiResponse(200, 'Success', users));
});

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    res.status(200).json(new ApiResponse(200, 'Success', user));
});

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, address } = req.body;

    // Check if the user with the given email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }

    // Assuming address is an array of objects from req.body
    const addressesArray = [];

    for (const addr of address) {
        const newAddress = await Address.create(addr);
        addressesArray.push({
            addressId: newAddress._id,
            address: newAddress
        });
    }

    // Create the user with the array of addresses
    const user = await User.create({
        username,
        email,
        password,
        addresses: addressesArray
    });

    res.status(201).json(new ApiResponse(201, 'Success', { user }));
});




const updateAddress = asyncHandler(async (req, res) => {
    const {userId,addressId} = req.params;

    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Find the index of the address in the user's addresses array
    const addressIndex = user.addresses.findIndex(addr => addr._id.equals(addressId));

    if (addressIndex === -1) {
        throw new ApiError(404, 'Address not found');
    }

    // Update the specific address
    user.addresses[addressIndex].address = updatedAddress;

    // Save the updated user
    await user.save();

    res.status(200).json(new ApiResponse(200, 'Address updated successfully', { user }));
});

export {
    getAllUsers,
    getUser,
    registerUser,
    updateAddress,
};