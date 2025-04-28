import { sendResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";
const authUser = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        sendResponse(res, 401, false, "Unauthorized", "No token provided");
        return;
    }
    try{
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        if(!decoded.id) {
            sendResponse(res, 401, false, "Unauthorized", "Invalid token");
            return;
        }else{
        req.body.userId = decoded.id;//Track the user by its id as id is the unique identifier for the user
        }
        next();

    }catch(error){
        sendResponse(res, 401, false, "Unauthorized", "Invalid token");
        return;
    }

}

export default authUser;