import User from "../modules/users.model.js";
import Notification from "../modules/notifications.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfileController = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) return res.status(404).json({ error_message: "user not found" });

    return res.status(20).json(user);
  } catch (e) {
    return res.status(500).json({
      error_message: `Internal server error in getUserProfileController: ${
        e.message || e
      }`,
    });
  }
};

// Controller to handle following and unfollowing users
export const followUnFollowUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user to modify and the current logged-in user
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id); // Get logged-in user from JWT

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error_message: "User not found" });
    }

    // Prevent user from following or unfollowing themselves
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error_message: "You cannot follow/unfollow yourself" });
    }

    // Check if the user is already following the target user
    if (currentUser.following.includes(id)) {
      // Unfollow the user
      currentUser.following = currentUser.following.filter(
        (userId) => userId.toString() !== id
      );
      userToModify.followers = userToModify.followers.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      await currentUser.save();
      await userToModify.save();
      const newNotification = new Notification({
        type: "unfollow",
        from: req.user._id,
        to: userToModify.id,
      });
      await newNotification.save();
      return res
        .status(200)
        .json({ success_message: "User unfollowed successfully" });
    } else {
      // Follow the user
      currentUser.following.push(id);
      userToModify.followers.push(req.user._id);
      await currentUser.save();
      await userToModify.save();
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify.id,
      });
      await newNotification.save();
      return res
        .status(200)
        .json({ success_message: "User followed successfully" });
    }
  } catch (e) {
    return res.status(500).json({
      error_message: `Internal server error in followUnFollowUserController: ${
        e.message || e
      }`,
    });
  }
};

export const getSuggestedUsersController = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find the current user to get their list of following users
    const currentUser = await User.findById(currentUserId).select("following");

    if (!currentUser) {
      return res.status(404).json({ error_message: "Current user not found" });
    }

    // Get all users except the current user and the users they are already following
    const excludedUsers = [...currentUser.following, currentUserId]; // Include followed users and self

    // Get 10 random users who are not the current user and not in the list of followed users
    const randomUsers = await User.aggregate([
      { $match: { _id: { $nin: excludedUsers } } }, // Exclude followed and current user
      { $sample: { size: 10 } }, // Randomly select 10 users
    ]);

    if (randomUsers.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No suggested users found" });
    }

    return res.status(200).json({ suggestedUsers: randomUsers }); // Return the list of 10 users
  } catch (e) {
    return res.status(500).json({
      error_message: `Internal server error in getSuggestedUsersController: ${
        e.message || e
      }`,
    });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const {
      username,
      email,
      profile_image,
      cover_image,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;

    const userId = req.user._id; // Get the current user's ID from the request (protectedRoute middleware)

    // Find the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error_message: "User not found" });
    }

    // Check if the new username or email is already taken (and not by the current user)
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ error_message: "Username is already taken" });
    }

    if (existingEmail && existingEmail._id.toString() !== userId.toString()) {
      return res.status(400).json({ error_message: "Email is already taken" });
    }

    // If password is being updated, verify current password and hash new password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error_message: "Current password is required to update the password",
        });
      }
      if (currentPassword.length < 6) {
        return res.status(400).json({ error_message: "Password must be at least 6 characters" });
      }

      // Check if the current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error_message: "Current password is incorrect" });
      }

      // Hash the new password before updating
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
    }

    // Handle Profile Image Upload
    if (profile_image) {
      if (user.profile_image) {
        await cloudinary.uploader.destroy(user.profile_image.split("/").pop().split(".")[0]); // Delete old profile image from Cloudinary
      }
      const uploaded_profile_image = await cloudinary.uploader.upload(profile_image);
      user.profile_image = uploaded_profile_image.secure_url; // Set new profile image URL
    }

    // Handle Cover Image Upload
    if (cover_image) {
      if (user.cover_image) {
        await cloudinary.uploader.destroy(user.cover_image.split("/").pop().split(".")[0]); // Delete old profile image from Cloudinary
      }
      const uploaded_cover_image = await cloudinary.uploader.upload(cover_image);
      user.cover_image = uploaded_cover_image.secure_url; // Set new cover image URL
    }

    // Update other fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    // Save the updated user
    const updatedUser = await user.save();

    return res.status(200).json({
      success_message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (e) {
    return res.status(500).json({
      error_message: `Internal server error in updateProfileController: ${
        e.message || e
      }`,
    });
  }
};

