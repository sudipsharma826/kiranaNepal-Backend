import express from 'express';
import { upload } from '../middleware/multer.js';
import { addProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct } from '../controllers/productController.js';
import authSeller from '../middleware/sellerMiddleware.js';


const productRouter = express.Router();
productRouter.post('/add_product',upload.single('image'),authSeller,addProduct);
productRouter.get('/get_products',getAllProducts);
productRouter.get('/get_product/:slug',getSingleProduct); 
productRouter.put('/update_product/:slug',upload.single('image'),authSeller,updateProduct); 
productRouter.post('/delete_product/:slug',authSeller,deleteProduct);

export default productRouter;