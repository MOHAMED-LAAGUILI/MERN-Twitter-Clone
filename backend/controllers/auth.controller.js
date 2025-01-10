import bcrypt from "bcryptjs";
import User from "./../modules/user.model.js";
import { generateTokenAndSetCookie } from "./../lib/generateTokenAndSetCookie.js";


export const signupController = async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Validate username
      const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/; // Alphanumeric and underscores, 3-15 characters
      if (!usernameRegex.test(username)) {
        return res
          .status(400)
          .json({ error_message: "Username must be 3-15 characters, alphanumeric or underscores only." });
      }
  
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ error_message: "Invalid email format." });
      }
  
      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error_message:
            "Password must be at least 6 characters long, include uppercase, lowercase, a number, and a special character.",
        });
      }
  
      // Check for existing username or email
      const existingUser = await User.findOne({ username });
      const existingEmail = await User.findOne({ email });
  
      if (existingUser || existingEmail) {
        return res
          .status(400)
          .json({ error_message: "Username or email already taken." });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
      });
  
      await newUser.save(); // Ensure the user is saved before generating a token
  
      // Generate token and set cookie
      generateTokenAndSetCookie(newUser._id, res);
  
      // Respond with success
      return res.status(200).json({
        success_message: "User Created",
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profile_image: newUser.profile_image,
        cover_image: newUser.cover_image,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ error_message: `Internal server error: ${e.message || e}` });
    }
  };

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error_message: "Email and password are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error_message: "Invalid email format." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error_message: "User not found." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error_message: "Invalid Credentials." });
    }

    // Generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Return user details (excluding password)
    return res.status(200).json({
      success_message: "Login successful",
      _id: user._id,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profile_image: user.profile_image,
      cover_image: user.cover_image,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error_message: `Internal server error: ${e.message || e}` });
  }
};
export const logoutController = (req, res) => {
    try {
      // Clear the authentication cookie
      res.cookie("token", "", {
        httpOnly: true, // Prevent client-side access
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict", // Prevent CSRF
        expires: new Date(0), // Expire the cookie immediately
      });
  
      return res.status(200).json({ success_message: "Logout successful." });
    } catch (e) {
      return res
        .status(500)
        .json({ error_message: `Internal server error: ${e.message || e}` });
    }
  };
  
  export const getMeController = async (req, res) => {
    try {
      // Retrieve the user ID from the request object (set by the protected middleware)
      const user = await User.findById(req.user._id).select("-password");
  
      // Respond with user details
      return res.status(200).json({
        success_message: "User retrieved successfully.",
        user,
      });
    } catch (e) {
      // Handle errors
      return res
        .status(500)
        .json({ error_message: `Internal server error: ${e.message || e}` });
    }
  };
  