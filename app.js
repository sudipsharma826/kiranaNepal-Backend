import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import sellerRouter from './routes/sellerRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import addressRouter from './routes/addressRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import subscriberRouter from './routes/subscriberRoutes.js';
dotenv.config();


//Create an express application
const app = express();

//Port number to run the server
const PORT = process.env.PORT 

//Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,

}));


//Mount the database connection string
await connectDB();

//Testing Routes
app.get('/', (req, res) => {res.send('Server is Running')});

//Importing the routes
app.use('/api/user',userRouter);//e.g the endpoint for registration be : /api/user/register
app.use('/api/seller',sellerRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/address',addressRouter);
app.use('/api/order',orderRouter);
app.use('/api/category',categoryRouter);
app.use('/api/subscriber',subscriberRouter);

//Start the server
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
});