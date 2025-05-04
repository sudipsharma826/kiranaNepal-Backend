import express from 'express';
import  {googleLogin, isAuth, registerUser, updateUserProfile, userLogin, userLogout } from '../controllers/userController.js';
import authUser from '../middleware/authMiddleware.js';
import { upload } from '../configs/multer.js';
const userRouter = express.Router();

//Define the routes for user-related operations
userRouter.post('/register',upload.single('image'),registerUser);
userRouter.post('/login',userLogin);
userRouter.get('/isAuth',authUser,isAuth);
userRouter.get('/logout',authUser,userLogout);
userRouter.post('/googleLogin',googleLogin);
userRouter.put('/updateProfile',authUser,upload.single('image'),updateUserProfile);

//Export
export default userRouter;
