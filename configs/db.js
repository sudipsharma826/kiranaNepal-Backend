import mongoose from "mongoose";

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(`${process.env.MONGO_URI}/kiranaNepal`);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

export default connectDB;
