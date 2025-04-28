import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    tags: {
        type: [String],  // Changed this to an array of strings
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const products = mongoose.model('product', productSchema);  // Simplified to 'product'
export default products;
