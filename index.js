import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { connectDB } from './config/db.js';
import productRouter from './route/productRoute.js';
import userRoute from './route/userRoute.js'
const app = express();
const PORT = process.env.PORT; 

// Middleware
app.use(express.json()); 
app.use(cors());

//
app.use("/api/product",productRouter)
app.use("/api/user",userRoute)




connectDB()

// Starting the server
app.listen(PORT, () => {
    console.log(`App Running Successfully on PORT ${PORT}`);
});
