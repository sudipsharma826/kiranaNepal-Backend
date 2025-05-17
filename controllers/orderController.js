import order from "../models/ordersModel.js";
import products from "../models/productModel.js";
import { sendResponse } from "../utils/response.js";
import axios from "axios";

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

// Handle Online Payment
export const khaltiPayment = async (req, res) => {
  try {
    const { items, address, name, email, phone, tax, shippingFee } = req.body;
    const userId = req.userId;
    const return_url = process.env.KHALTI_RETURN_URL;
    const website_url = process.env.KHALTI_WEBSITE_URL;

    // Basic validation
    if (!userId || !items || !address) {
      sendResponse(res, 400, false, "Please fill all the required fields");
      return;
    }

    // Get product details and enrich items
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await products.findById(item.id);
      if (!product) throw new Error(`Product not found for ID: ${item.id}`);

      const price = Number(product.price);
      const quantity = Number(item.quantity);
      const total = Number((price * quantity).toFixed(2));

      return {
        id: item.id,
        name: product.name,
        price,
        quantity,
        total,
        image: product.image, 
      };
    }));

    const markPrice = enrichedItems.reduce((acc, i) => acc + i.total, 0);
    const vat = Math.round(markPrice * 0.13);
    const total = (markPrice + vat) * 100; // convert to paisa

    // Save order in DB
    const newOrder = await order.create({
      userId,
      address,
      status: "pending",
      paymentMethod: "Khalti",
      items: enrichedItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        amount: item.total,
        image: item.image,
      })),
      total,
      date: new Date().toISOString(),
      timeline: [{ status: "pending", date: new Date().toISOString() }],
    });

    if (!newOrder) {
      sendResponse(res, 500, false, "Failed to save order in DB");
      return;
    }

    // Prepare Khalti payload
    const khaltiPayload = {
      return_url,
      website_url,
      amount: total,
      purchase_order_id: newOrder.orderId,
      purchase_order_name: newOrder.trackingNumber,
      customer_info: {
        name,
        email,
        phone
      },
      amount_breakdown: [
        { label: "Mark Price", amount: markPrice * 100 },
        { label: "Tax", amount: vat * 100 },
        { label: "Shipping Fee", amount: shippingFee ? shippingFee * 100 : 0 },
      ],
      product_details: enrichedItems.map((item) => ({
        identity: item.id,
        name: item.name,
        total_price: item.total,
        quantity: item.quantity,
        unit_price: item.price * 100,
      })),
      merchant_username: process.env.KHALTI_MERCHANT_USERNAME,
      merchant_extra: process.env.KHALTI_MERCHANT_EXTRA,
    };

    console.log("Khalti Payload:", khaltiPayload);

    // Call Khalti API
    const khaltiResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      khaltiPayload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Redirect to Khalti",
      data: khaltiResponse.data,
    });

  } catch (err) {
    console.error("Khalti payment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Payment Verification
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, txnId, purchase_order_id, purchase_order_name } = req.body;

    // Basic validation
    if (!pidx || !txnId || !purchase_order_id || !purchase_order_name) {
      return sendResponse(res, 400, false, "Please fill all the required fields");
    }

    // Call Khalti API to verify the payment
    const khaltiResponse = await axios.post(
      `https://a.khalti.com/api/v2/epayment/lookup/`,
      {
        pidx, //Pidx is ppassed to check the khalti payment status
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    

    const data = khaltiResponse?.data;

    if (!data) {
      return sendResponse(res, 500, false, "Failed to verify payment");
    }

    if (data.status !== "Completed") {
      return sendResponse(res, 400, false, "Payment not completed", data);
    }

    // Check for matching order using safe and consistent query
    const orderDetails = await order.findOne({
      orderId: purchase_order_id,
      trackingNumber: purchase_order_name,
    });

    if (!orderDetails) {
      return sendResponse(res, 404, false, "Order not found");
    }

    if (orderDetails.status === "confirmed") {
      return sendResponse(res, 200, true, "Order already marked as paid");
    }

    // Update order status and transaction details
    const updatedOrder = await order.findOneAndUpdate(
      {
        orderId: purchase_order_id,
        trackingNumber: purchase_order_name,
      },
      {
        $set: {
          status: "confirmed",
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return sendResponse(res, 500, false, "Failed to update order status");
    }

    return sendResponse(res, 200, true, "Payment verified successfully", {
      orderId: updatedOrder.orderId,
      trackingNumber: updatedOrder.trackingNumber,
      paymentMethod: updatedOrder.paymentMethod,
      amount: updatedOrder.total,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return sendResponse(res, 500, false, "Internal server error", error.message);
  }
};
