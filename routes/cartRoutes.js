import express from 'express';
import { update_cart } from '../controllers/cartController.js';
import authUser from '../middleware/authMiddleware.js';

const cartRouter = express.Router();
//Cart Routes
cartRouter.post('/update_cart', authUser, update_cart); // Update cart

export default cartRouter;