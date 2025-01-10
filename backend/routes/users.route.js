import express from "express";
import { protectedRoute } from "../lib/protectedRoute.js";
import {
  followUnFollowUserController,
  getSuggestedUsersController,
  getUserProfileController,
  updateProfileController,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get(
  "/get-user-profile/:username",
  protectedRoute,
  getUserProfileController
);
router.post(
  "/follow-unfollow-user/:id",
  protectedRoute,
  followUnFollowUserController
);
router.get(
  "/get-suggested-users",
  protectedRoute,
  getSuggestedUsersController
);

router.post(
    "/update-profile",
     protectedRoute,
    updateProfileController
    );

export default router;
