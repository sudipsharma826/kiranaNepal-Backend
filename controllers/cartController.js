import user from "../models/userModel.js";
import { sendResponse } from "../utils/response.js";
export const update_cart = async (req, res) => {
    const {userId,cartItems} = req.body;
    if (!userId || !cartItems) {
        sendResponse(res, 400, false, "Please fill all the fields");
        return;
    }
    try {
        const user = await user.findById(userId);
        if (!user) {
            sendResponse(res, 404, false, "User not found");
            return;
        }
        user.cart = cartItems;
        await user.save();
        sendResponse(res, 200, true, "Cart updated successfully", user.cart);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }

}
