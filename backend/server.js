// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './db/db.js';
import authRoute from "./routes/auth.route.js"
// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware setup
app.use(express.json()); // Parse JSON requests
app.use(cors({
    origin:"http://localhost:",
    credentials:true
})); // Enable Cross-Origin Resource Sharing
app.use(cookieParser()); // Parse cookies

app.get('/api/auth', authRoute);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    connectDB();
    console.warn(`Server is running on http://localhost:${PORT}`);
});
