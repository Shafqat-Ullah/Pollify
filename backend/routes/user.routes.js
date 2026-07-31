import express from "express";
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  getDashboard,
  toggleFollow,
} from "../controllers/user.controller.js";
import { getMyVotes } from "../controllers/vote.controller.js";
import { getMyBookmarks } from "../controllers/bookmark.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/me/dashboard", protect, getDashboard);
router.put("/me", protect, updateProfile);
router.put("/me/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/me/password", protect, changePassword);
router.get("/me/votes", protect, getMyVotes);
router.get("/me/bookmarks", protect, getMyBookmarks);

router.get("/:username", getUserProfile);
router.post("/:id/follow", protect, toggleFollow);

export default router;
