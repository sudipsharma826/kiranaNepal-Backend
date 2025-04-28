import { sendResponse } from "../utils/response.js";
import jwt from "jsonwebtoken"; 

// Login the seller
export const sellerLogin = (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }

        // Check the seller static email and password from env file
        if (email === process.env.SELLER_EMAIL && password === process.env.SELLER_PASSWORD) {
            // Generate the token
            const token = jwt.sign({ id: email }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });
            // Send the token in the response with a cookie
            res.cookie("sellerToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            sendResponse(res, 200, true, "Seller logged in successfully", email);
        } else {
            sendResponse(res, 401, false, "Invalid email or password");
        }

    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

//Seller Logout controller
export const sellerLogout = (req, res) => {
    try {
        res.clearCookie("sellerToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        sendResponse(res, 200, true, "Seller logged out successfully");
    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};
