import express from 'express';
import  {} from '../controllers/userController.js';
import { sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middleware/sellerMiddleware.js';


const sellerRouter = express.Router();

//Define the routes for seller-related operations
sellerRouter.post('/login',sellerLogin );
sellerRouter.get('/logout',authSeller,sellerLogout);


//Export
export default sellerRouter;
