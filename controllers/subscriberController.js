import Subscriber from "../models/subscriberModel.js";
import { sendResponse } from "../utils/response.js";

export const addSubscriber = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return sendResponse(res, 409, "Email already exists");
        }

        // Create a new subscriber
        const newSubscriber = await Subscriber.create({ email });
        sendResponse(res, 201, "Subscriber added successfully", newSubscriber);
    } catch (error) {
        sendResponse(res, 500, "Internal server error", error.message);
    }
};
