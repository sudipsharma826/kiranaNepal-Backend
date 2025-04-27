import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("Database URL: ", process.env.MONGO_URI);
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/kiranaNepal`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

export default connectDB;
