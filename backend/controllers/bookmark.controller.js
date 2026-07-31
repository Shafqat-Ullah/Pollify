import Bookmark from "../models/Bookmark.js";
import Poll from "../models/Poll.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route POST /api/polls/:id/bookmark — toggles bookmark on/off
export const toggleBookmark = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");

  const existing = await Bookmark.findOne({ poll: poll._id, user: req.user._id });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, data: { bookmarked: false } });
  }

  await Bookmark.create({ poll: poll._id, user: req.user._id });
  res.status(200).json({ success: true, data: { bookmarked: true } });
});

// @route GET /api/users/me/bookmarks
export const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: "poll",
      populate: { path: "author", select: "name username avatar" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { bookmarks } });
});
