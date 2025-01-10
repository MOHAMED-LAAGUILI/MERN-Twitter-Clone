// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from "cloudinary";
import connectDB from './db/db.js';
import authRoute from "./routes/auth.route.js"
import usersRoute from "./routes/users.route.js"

// Load environment variables from .env file
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
})
// Create an Express application
const app = express();

// Middleware setup
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({extended:true}))// parse form data 

app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await connectDB();
    console.warn(`Server is running on http://localhost:${PORT}`);
});
