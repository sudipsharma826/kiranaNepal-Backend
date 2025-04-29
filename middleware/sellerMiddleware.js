import { sendResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";
const authSeller = (req, res, next) => {
    const sellerToken = req.cookies.sellerToken;
    if (!sellerToken) {
        sendResponse(res, 401, false, "Unauthorized", "No token provided");
        return;
    }
    try{
        const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if(!decoded.email === process.env.SELLER_EMAIL) {
            sendResponse(res, 401, false, "Unauthorized", "Invalid token");
            return;
        }
        req.sellerEmail = decoded.email;
        next();

    }catch(error){
        sendResponse(res, 401, false, "Unauthorized", "Invalid token");
        return;
    }

}

export default authSeller;