import express from "express";
import {
  getMeController,
  loginController,
  logoutController,
  signupController,
} from "../controllers/users.controller.js";
import { protectedRoute } from "../lib/protectedRoute.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/get-me", protectedRoute, getMeController);
router.post("/logout", logoutController);

export default router;
