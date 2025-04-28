import products from '../models/productModel.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { sendResponse } from "../utils/response.js";

export const addProduct = async (req, res) => {
    try {
        console.log(req.body, req.file);
        if (!req.body || !req.file) {
            sendResponse(res, 400, false, "Form-data is incomplete or missing");
            return;
        }

        const { name, category, price, rating, reviews, description, tags, stock } = req.body;
        const uploadedImage = req.file;


        if (!name || !category || !price || !rating || !reviews || !description || !tags || !stock || !uploadedImage) {
            sendResponse(res, 400, false, "Please fill all the fields including image");
            return;
        }

        const imageURL = await uploadToCloudinary(uploadedImage);
        if (!imageURL) {
            sendResponse(res, 500, false, "Image upload failed");
            return;
        }

        const slug = name.replace(/\s+/g, '-').toLowerCase();

        const newProduct = await products.create({
            name,
            category,
            price,
            rating,
            reviews,
            image: imageURL.secure_url,
            description,
            tags,
            stock,
            slug,
        });

        sendResponse(res, 201, true, "Product added successfully", newProduct);
    } catch (error) {
        if(error.code === 11000) {
            sendResponse(res, 400, false, "Product already exists with this name or ", error.message);
            return;
        }
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
}
