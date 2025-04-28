import products from '../models/productModel.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';
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
        let tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()); //Convert the string list into the array

        const newProduct = await products.create({
            name,
            category,
            price,
            rating,
            reviews,
            image: imageURL.secure_url,
            description,
            tags: tagArray,
            stock,
            slug,
        });

        sendResponse(res, 201, true, "Product added successfully", newProduct);
    } catch (error) {
        if(error.code === 11000) {
            sendResponse(res, 400, false, "Product already exists with this name ", error.message);
            return;
        }
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};


//Get all products
export const getAllProducts = async (req, res) => {
    try {
        const productsList = await products.find({});
        sendResponse(res, 200, true, "Products fetched successfully", productsList);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

//Get single product
export const getSingleProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await products.findOne({slug : slug});
        if (!product) {
            sendResponse(res, 404, false, "Product not found");
            return;
        }
        sendResponse(res, 200, true, "Product fetched successfully", product);
    }
    catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
}

//Update the product
export const updateProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, category, price, rating, reviews, description, tags, stock } = req.body;
        const uploadedImage = req.file;

        if (!name || !category || !price || !rating || !reviews || !description || !tags || !stock) {
            sendResponse(res, 400, false, "Please fill all the fields");
            return;
        }

        let imageURL;
        if (uploadedImage) {
            imageURL = await uploadToCloudinary(uploadedImage);
            if (!imageURL) {
                sendResponse(res, 500, false, "Image upload failed");
                return;
            }
        }

        const updatedProduct = await products.findOneAndUpdate({slug}, {
            name,
            category,
            price,
            rating,
            reviews,
            description,
            tags,
            stock,
            ...(imageURL && { image: imageURL.secure_url })
        }, { new: true });

        if (!updatedProduct) {
            sendResponse(res, 404, false, "Product not found");
            return;
        }

        sendResponse(res, 200, true, "Product updated successfully", updatedProduct);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
}

//Delete the product
export const deleteProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const deletedProduct = await products.findOneAndDelete({slug});
        if (!deletedProduct) {
            sendResponse(res, 404, false, "Product not found");
            return;
        }
        //Deleted the image from the cloudinary
        if (deletedProduct) {
            await deleteFromCloudinary(deletedProduct.image);
        }
        sendResponse(res, 200, true, "Product deleted successfully", deletedProduct);
    }
    catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
}

