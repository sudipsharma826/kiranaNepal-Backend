import express from 'express';
import { addAddress, deleteAddress, getAddress, updateAddress } from '../controllers/addressController.js';
import authUser from '../middleware/authMiddleware.js';

const addressRouter = express.Router();

addressRouter.post('/add_address', authUser, addAddress); 
addressRouter.get('/get_address', authUser, getAddress); 
addressRouter.put('/update_address', authUser, updateAddress); 
addressRouter.delete('/delete_address', authUser, deleteAddress); 

export default addressRouter;