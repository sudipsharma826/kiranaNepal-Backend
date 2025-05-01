import express from 'express';
import  {} from '../controllers/userController.js';
import { sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middleware/sellerMiddleware.js';


const sellerRouter = express.Router();

//Define the routes for seller-related operations
sellerRouter.post('/login',sellerLogin );
sellerRouter.get('/logout',authSeller,sellerLogout);
sellerRouter.get('/checkSeller', authSeller, (req, res) => {
  
        res.status(200).json({
            success: true,
            message: "Seller is logged in",
            data: req.sellerEmail,
        });
});

  


//Export
export default sellerRouter;
