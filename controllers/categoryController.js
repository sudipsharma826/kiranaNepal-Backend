import Category from "../models/categoryModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendResponse } from "../utils/response.js";

// Add Category
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.files?.image?.[0];
    const icon = req.files?.icon?.[0];

    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // Validate required fields
    if (!name || !description || !image || !icon) {
      return sendResponse(res, 400, false, "Please fill all the fields");
    }

    // Upload image and icon to Cloudinary
    const imageUrl = await uploadToCloudinary(image);
    const iconUrl = await uploadToCloudinary(icon);

    if (!imageUrl || !iconUrl) {
      return sendResponse(res, 500, false, "Image upload failed");
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return sendResponse(res, 409, false, "Category already exists");
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Create category in DB
    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl.secure_url,
      icon: iconUrl.secure_url,
      totalproducts: 0,
      products: [],
    });

    if (!category) {
      return sendResponse(res, 500, false, "Category creation failed");
    }

    return sendResponse(res, 201, true, "Category created successfully", category);
  } catch (error) {
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    if (!categories) {
      return sendResponse(res, 404, false, "No categories found");
    }
    return sendResponse(res, 200, true, "Categories fetched successfully", categories);
  } catch (error) {
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};

//Get all category for public
export const getAllCategoriesForPublic = async (req, res) => {
  try {
    const categories = await Category.find({},"name description totalproducts image icon").sort({ createdAt: -1 });
    if (!categories) {
      return sendResponse(res, 404, false, "No categories found");
    }
    return sendResponse(res, 200, true, "Categories fetched successfully", categories);
  } catch (error) {
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }
    return sendResponse(res, 200, true, "Category fetched successfully", category);
  } catch (error) {
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, description } = req.body;
    const image = req.files?.image?.[0];
    const icon = req.files?.icon?.[0];

    // Validate required fields
    if (!name || !description || !image || !icon) {
      return sendResponse(res, 400, false, "Please fill all the fields");
    }

    // Upload image and icon to Cloudinary
    const imageUrl = await uploadToCloudinary(image);
    const iconUrl = await uploadToCloudinary(icon);

    if (!imageUrl || !iconUrl) {
      return sendResponse(res, 500, false, "Image upload failed");
    }

    // Generate slug from name
    const updatedslug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Update category in DB
    const updatedCategory = await Category.findByIdAndUpdate(
      slug,
      {
        name,
        slug:updatedslug,
        description,
        image: imageUrl.secure_url,
        icon: iconUrl.secure_url,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return sendResponse(res, 404, false, "Category not found");
    }

    return sendResponse(res, 200, true, "Category updated successfully", updatedCategory);
  } catch (error) {
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};

