import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
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
app.get('/', (req, res) => {res.send('Server is Running');});

//Importing the routes
app.use('/api/user',userRouter);//e.g the endpoint for registration be : /api/user/register

//Start the server
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
});