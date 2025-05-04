import express from 'express';
import { get_cart, update_cart } from '../controllers/cartController.js';
import authUser from '../middleware/authMiddleware.js';

const cartRouter = express.Router();
//Cart Routes
cartRouter.get('/get_cart', authUser, get_cart); // Get cart items
cartRouter.post('/update_cart', authUser, update_cart); // Update cart

export default cartRouter;