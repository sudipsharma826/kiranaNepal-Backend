import express from 'express';
import  {googleLogin, registerUser, userLogin, userLogout } from '../controllers/userController.js';
import authUser from '../middleware/authMiddleware.js';

const userRouter = express.Router();

//Define the routes for user-related operations
userRouter.post('/register',registerUser);
userRouter.post('/login',userLogin);
userRouter.get('/isAuth',authUser);
userRouter.get('/logout',authUser,userLogout);
userRouter.post('/googleLogin',googleLogin);

//Export
export default userRouter;
