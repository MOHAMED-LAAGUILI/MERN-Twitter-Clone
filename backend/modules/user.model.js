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
  },
  password: {
    type: String,
    required: true,
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
cover_image: {
    type: String,
    default:""
  },
  bio: {
    type: String,
    default:""
  },
  link: {
    type: String,
    default:""
  },
},{timestamps:true});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
export default  User;
