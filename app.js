import express from 'express';
import dotenv from 'dotenv';
dotenv.config();


//Create an express application
const app = express();

//Port number to run the server
const PORT = process.env.PORT 

//Testing Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

//Start the server
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
});