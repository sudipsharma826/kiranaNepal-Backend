import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
import { sendResponse } from "../utils/response.js";
import user from "../models/userModel.js";

export const registerUser = async (req, res) => {
    try {
        // Get the data from the body
        const { name, email, password } = req.body;

        // Check if all fields are filled or not
        if (!name || !email || !password) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }

        // Check if the user already exists
        const alreadyExists = await user.findOne({ email });
        if (alreadyExists) {
            sendResponse(res, 400, false, "User already exists");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Register the user
        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
        }); 

        // Generate the token
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET , 
            {
                expiresIn: process.env.JWT_EXPIRES_IN , 
            }
        );

        // Send the token in the response with a cookie
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });

        // Remove the password from the newUser object before sending the response
        const { password: removedPassword, ...userData } = newUser.toObject(); // Use toObject() for Mongoose docs

        sendResponse(res, 201, true, "User registered successfully", userData);

    } catch (error) {
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};


//Controller to Login
export const userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;

        //Check if all fields are filled or not
        if(!email || !password){
            sendResponse(res,400,false,"Please fill all the fields");
            return;
        }
        //check if the user exists or not
        const userExists=await user.findOne({email});
        if(!userExists){
            sendResponse(res,400,false,"User does not exist");
            return;
        }
        //Check if the password is correct or not
        const isPasswordCorrect=await bcrypt.compare(password,userExists.password);
        if(!isPasswordCorrect){
            sendResponse(res,400,false,"Incorrect password");
            return;
        }
        //Generate the token
        const token=jwt.sign({id:userExists._id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRES_IN,
        });
        //Send the token in the response with a cookie
        res.cookie("accessToken",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000,
        });
        //Remove the password from the user object before sending the response
        const {password:removedPassword,...userData}=userExists.toObject(); 
        sendResponse(res,200,true,"User logged in successfully",userData);

    }catch(error){
        sendResponse(res,500,false,"Internal server error",error.message);
    }
}

//Logout controller
export const userLogout=async(req,res)=>{
    try{
        res.clearCookie("accessToken",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
        });
        sendResponse(res,200,true,"User logged out successfully");
    }catch(error){
        sendResponse(res,500,false,"Internal server error",error.message);
    }
}