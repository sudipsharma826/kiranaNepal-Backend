import Category from '../models/categoryModel.js';
import products from '../models/productModel.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';
import { sendResponse } from "../utils/response.js";

// Helper to normalize tags
const normalizeTags = (tags) =>
    Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

export const addProduct = async (req, res) => {
    try {
        if (!req.body || !req.file) {
            return sendResponse(res, 400, false, "Form-data is incomplete or missing");
        }

        const { name, category, price, rating, reviews, description, tags, stock } = req.body;
        const uploadedImage = req.file;

        if (!name || !category || !price || !rating || !reviews || !description || !tags || !stock || !uploadedImage) {
            return sendResponse(res, 400, false, "Please fill all the fields including image");
        }

        const imageURL = await uploadToCloudinary(uploadedImage);
        if (!imageURL) {
            return sendResponse(res, 500, false, "Image upload failed");
        }

        const slug = name.replace(/\s+/g, '-').toLowerCase();
        const tagArray = normalizeTags(tags);

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

        const categoryUpdate = await Category.findOneAndUpdate(
            { name: category },
            {
                $push: { products: newProduct._id },
                $inc: { totalProducts: 1 }
            },
            { new: true }
        );

        if (!categoryUpdate) {
            return sendResponse(res, 404, false, "Category not found");
        }

        sendResponse(res, 201, true, "Product added successfully", newProduct);
    } catch (error) {
        if (error.code === 11000) {
            return sendResponse(res, 400, false, "Product already exists with this name", error.message);
        }
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const productsList = await products.find({});
        sendResponse(res, 200, true, "Products fetched successfully", productsList);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await products.findOne({ slug });
        if (!product) {
            return sendResponse(res, 404, false, "Product not found");
        }
        sendResponse(res, 200, true, "Product fetched successfully", product);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, category, price, rating, reviews, description, tags, stock } = req.body;
        const uploadedImage = req.file;

        if (!name || !category || !price || !rating || !reviews || !description || !tags || !stock) {
            return sendResponse(res, 400, false, "Please fill all the fields");
        }

        const existingProduct = await products.findOne({ slug });
        if (!existingProduct) {
            return sendResponse(res, 404, false, "Product not found");
        }
        console.log("Existing Product:", existingProduct);

        let imageURL;
        if (uploadedImage) {
            imageURL = await uploadToCloudinary(uploadedImage);
            if (!imageURL) {
                return sendResponse(res, 500, false, "Image upload failed");
            }
        }

        const updatedSlug = name.replace(/\s+/g, '-').toLowerCase();
        const tagArray = normalizeTags(tags);

        const updatedProduct = await products.findOneAndUpdate(
            { slug },
            {
                name,
                category,
                price,
                rating,
                reviews,
                description,
                tags: tagArray,
                stock,
                slug: updatedSlug,
                ...(imageURL && { image: imageURL.secure_url })
            },
            { new: true }
        );

        // Handle category change
        if (existingProduct.category !== category) {
            await Category.findOneAndUpdate(
                { name: existingProduct.category },
                {
                    $pull: { products: existingProduct._id },
                    $inc: { totalProducts: -1 }
                }
            );

            const newCategoryUpdate = await Category.findOneAndUpdate(
                { name: category },
                {
                    $addToSet: { products: updatedProduct._id },
                    $inc: { totalProducts: 1 }
                },
                { new: true }
            );

            if (!newCategoryUpdate) {
                return sendResponse(res, 404, false, "New category not found");
            }
        }

        sendResponse(res, 200, true, "Product updated successfully", updatedProduct);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { slug } = req.params;

        const deletedProduct = await products.findOneAndDelete({ slug });

        if (!deletedProduct) {
            return sendResponse(res, 404, false, "Product not found");
        }

        if (deletedProduct.image) {
            await deleteFromCloudinary(deletedProduct.image);
        }

        await Category.findOneAndUpdate(
            { name: deletedProduct.category },
            {
                $pull: { products: deletedProduct._id },
                $inc: { totalProducts: -1 }
            }
        );

        sendResponse(res, 200, true, "Product deleted successfully", deletedProduct);
    } catch (error) {
        console.error('Error:', error);
        sendResponse(res, 500, false, "Internal server error", error.message);
    }
};
