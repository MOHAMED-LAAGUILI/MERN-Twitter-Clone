// userModel.js
import mongoose  from 'mongoose';

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },

  followers: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:[]
  }
],
following: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:[]
  }
],
profile_image: {
    type: String,
    default:""
  },
  profile_cover: {
    type: String,
    default:""
  },
},{timestamps:true});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
export default  User;
