import User from "../models/userModel.js";
import { sendResponse } from "../utils/response.js";


//Get the cart items of the user
export const get_cart = async (req, res) => {
    const userId=req.userId;
  try {
    const user = await User.findById(userId).select("cartItems");
    if (!user) {
      return sendResponse(res, 404, false, "User not found", null);
    }
    return sendResponse(res, 200, true, "Cart items fetched successfully", user.cartItems);
  } catch (error) {
    return sendResponse(res, 500, false, "Server error", error.message);
  }
};

//Update the cart items of the user
export const update_cart = async (req, res) => {
  const userId=req.userId;
  const { cartItems } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found", null);
    }
    user.cartItems = cartItems;
    await user.save();
    return sendResponse(res, 200, true, "Cart items updated successfully", user.cartItems);
    }
    catch (error) {
    return sendResponse(res, 500, false, "Server error", error.message);
    }
};
