import order from "../models/ordersModel.js";
import products from "../models/productModel.js";
import { sendResponse } from "../utils/response.js";

//place order using COD
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;

    if (!userId || !items || items.length === 0 || !address) {
      return sendResponse(res, 400, false, "Please fill all the required fields");
    }
    console.log("Items:", items);

    // Fetch each product's price and calculate totals
    const amountsArray = await Promise.all(items.map(async (item) => {
      const product = await products.findById(item.id);
      if (!product) throw new Error(`Product with ID ${item.name} not found`);
      return {
        ...item,
        name: product.name,
        price: product.price,
        image: product.image,
        amount: product.price * item.quantity
      };
    }));

    console.log("Amounts Array:", amountsArray);

    const subtotal = amountsArray.reduce((acc, item) => acc + item.amount, 0);
    const tax = (subtotal * 13) / 100;
    const deliveryCharges = subtotal < 500 ? 50 : 0;
    const total = subtotal + tax + deliveryCharges;

    console.log("Total:", total);

    // Prepare order items
    const formattedItems = amountsArray.map(({ id,name,quantity,price,image,amount }) => ({
    productId:id,
      name,
      quantity,
      price:Number(price),
      image,
      amount
    }));

    const newOrder = await order.create({
      userId,
      date: new Date().toISOString(),
      total,
      address,
      paymentMethod: "COD",
      status: "pending",
      items: formattedItems,
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [{ status: "pending", date: new Date().toISOString() }]
    });

    sendResponse(res, 201, true, "Order placed successfully", newOrder);
  } catch (error) {
    sendResponse(res, 500, false, "Internal server error", error.message);
  }
};
//Get all order by seller
export const getAllOrders = async (req, res) => {
  try {
    const ordersList = await order
      .find({})
      .populate("userId", "name  email address").sort({ createdAt: -1 });
    sendResponse(res, 200, true, "Orders fetched successfully", ordersList);
  } catch (error) {
    sendResponse(res, 500, false, "Internal server error", error.message);
  }
};
//Get all order by user
export const getUserOrder = async (req, res) => {
  try {
    const  userId  = req.userId;
    const ordersList = await order
      .find({ userId })
      .populate("userId", "name email address")
      .sort({ createdAt: -1 }); 
    sendResponse(res, 200, true, "Orders fetched successfully", ordersList);
  } catch (error) {
    sendResponse(res, 500, false, "Internal server error", error.message);
  }
};
//Update the order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return sendResponse(res, 400, false, "Please provide orderId and new status");
    }

    const updatedOrder = await order.findByIdAndUpdate(orderId, {
      status,
      $push: { timeline: { status, date: new Date().toISOString() } }
    }, { new: true });

    if (!updatedOrder) {
      return sendResponse(res, 404, false, "Order not found");
    }

    sendResponse(res, 200, true, "Order status updated", updatedOrder);
  } catch (error) {
    sendResponse(res, 500, false, "Internal server error", error.message);
  }
};
