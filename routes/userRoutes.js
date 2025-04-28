import express from 'express';
import  {registerUser, userLogin } from '../controllers/userController.js';

const userRouter = express.Router();

//Define the routes for user-related operations
userRouter.post('/register',registerUser);
userRouter.post('/login',userLogin);

//Export
export default userRouter;
