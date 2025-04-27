import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

}))

//Testing Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

//Start the server
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
});