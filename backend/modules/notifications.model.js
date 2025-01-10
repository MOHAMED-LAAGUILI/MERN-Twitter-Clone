// userModel.js
import mongoose  from 'mongoose';

// Define the schema for the User model
const notificationSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    required: true,
    enum: ["follow","unfollow", "like","comment",]
  },
  read: {
    type: Boolean,
    default: false
  },
},{timestamps:true});

// Create the User model from the schema
const Notification = mongoose.model('Notification', notificationSchema);

// Export the User model
export default  Notification;
