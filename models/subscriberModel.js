import mongoose from "mongoose";

const subscriberSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
});
const Subscriber = mongoose.models.subscriber || mongoose.model("subscriber", subscriberSchema);  // Simplified to 'subscriber'
export default Subscriber;