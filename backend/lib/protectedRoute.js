import jwt from "jsonwebtoken";
import User from "../modules/users.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    // Retrieve the token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res
        .status(401)
        .json({ error_message: "Unauthorized. Token missing." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ error_message: "User not found." });
    }

    // Attach user to request object for further use in route
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (e) {
    // Handle token verification errors
    return res
      .status(401)
      .json({ error_message: `Unauthorized. ${e.message || e}` });
  }
};
