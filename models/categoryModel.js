import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
    description: {
        type: String,
        required: true
      },
    icon: {
        type: String,
        required: true
      },
    image: {
        type: String,
        required: true
      },
    products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "product",
        default: []
      },
    slug: {
        type: String,
        required: true,
        unique: true
      },
    totalproducts: {
        type: Number,
        required: true
      },
},{timestamps: true});
const Category = mongoose.model("category", categorySchema);
export default Category;