import express from 'express';
import  {registerUser } from '../controllers/userController.js';

const userRouter = express.Router();

//Define the routes for user-related operations
userRouter.post('/register',registerUser);

//Export
export default userRouter;
