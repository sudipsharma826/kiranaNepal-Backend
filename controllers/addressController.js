import { sendResponse } from "../utils/response.js";
import Address from "../models/addressModel.js";
import user from "../models/userModel.js";

// Add address of the user
export const addAddress = async (req, res) => {
    try {
        const { address, city, state, country, pincode } = req.body;
        const userId = req.userId;
        if (!address || !city || !state || !country || !pincode || !userId) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }

        //Check if user already has an address
        const existingAddress = await Address.findOne({ userId });  
        if (existingAddress) {
            sendResponse(res, 400, false, "User already has an address. Please update it instead of adding a new one.");
            return;
        }
        const fullAddress = `${address}, ${city}, ${state}, ${country}, ${pincode}`;
        await Address.create({
            userId,
            address,
            city,
            state,
            country,
            pincode,
            fullAddress,
        });
        // Set full address in the user
        const userData = await user.findById(userId);
        userData.address=fullAddress; 
        await userData.save();
        sendResponse(res, 201, true, "Address added successfully", { address, city, state, country, pincode });
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

// Get Address of the user
export const getAddress = async (req, res) => {
    try {
        const { userId } = req;
        console.log(userId);
        const userAddress = await Address.find({ userId });
        sendResponse(res, 200, true, "Address fetched successfully", userAddress);
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

// Update Address of the user
export const updateAddress = async (req, res) => {
    try {
        const { addressId, address, city, state, country, pincode } = req.body;
        const userId = req.userId;
        if (!addressId || !address || !city || !state || !country || !pincode || !userId) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }
        const fullAddress = `${address}, ${city}, ${state}, ${country}, ${pincode}`;
        const updatedAddressData = await Address.findByIdAndUpdate(addressId, {
            userId,
            address,
            city,
            state,
            country,
            pincode,
            fullAddress
        }, { new: true });
        if (!updatedAddressData) {
            sendResponse(res, 404, false, "Address cannot be updated. Try again later");
            return;
        } else {
            // Update the full address in the user
            const userData = await user.findById(userId);
            userData.address = fullAddress; 
            await userData.save();
            sendResponse(res, 200, true, "Address updated successfully", updatedAddressData);
        }
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

// Delete Address of the user
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        const userId = req.userId;
        if (!addressId || !userId) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }
        const deleteAddress = await Address.findByIdAndDelete(addressId);
        if (!deleteAddress) {
            sendResponse(res, 404, false, "Address cannot be deleted. Try again later");
            return;
        } else {
            // Remove the full address from the user
            const userData = await user.findById(userId);
            userData.address = null;
            await userData.save();
            sendResponse(res, 200, true, "Address deleted successfully", {});
        }
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};
