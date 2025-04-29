import express from 'express';
import { getAllOrders, getUserOrder, placeOrderCOD, updateOrderStatus } from '../controllers/orderController.js';
import authSeller from '../middleware/sellerMiddleware.js';
import authUser from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.post('/place_order_COD', authUser, placeOrderCOD);
orderRouter.get('/get_orders',authSeller,getAllOrders);
orderRouter.get('/get_order',authUser,getUserOrder); 
orderRouter.put('/update_order_status',authSeller,updateOrderStatus);

export default orderRouter;


