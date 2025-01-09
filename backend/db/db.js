import mongoose from "mongoose";

// MongoDB connection

 const connectDB = async () => {
    try {
       const conn =  await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected successfully! ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process with an error
    }
};

export default connectDB;