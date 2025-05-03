import express from 'express';
import authSeller from '../middleware/sellerMiddleware.js';
import { addCategory, deleteCategory, getAllCategories, getAllCategoriesForPublic, getCategoryBySlug, updateCategory } from '../controllers/categoryController.js';
import { upload } from '../configs/multer.js';

const categoryRouter = express.Router();

categoryRouter.post('/add_category',upload.fields([{ name: 'image', maxCount: 1 },{ name: 'icon', maxCount: 1 }]),authSeller,addCategory
  );
categoryRouter.get('/get_categories', authSeller,getAllCategories);
categoryRouter.get('/get_category_public',getAllCategoriesForPublic);
categoryRouter.get('/get_category/:slug', getCategoryBySlug);
categoryRouter.put('/update_category/:slug', authSeller, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), updateCategory);
categoryRouter.delete('/delete_category/:slug', authSeller, deleteCategory);


  

export default categoryRouter;