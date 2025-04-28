import express from 'express';
import { upload } from '../middleware/multer.js';
import { addProduct } from '../controllers/productController.js';


const productRouter = express.Router();
productRouter.post('/add_product',upload.single('image'),addProduct);

export default productRouter;