import Like from "../models/Like.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route POST /api/polls/:id/like  — toggles like on/off
export const toggleLike = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");

  const existing = await Like.findOne({ poll: poll._id, user: req.user._id });

  if (existing) {
    await existing.deleteOne();
    poll.likesCount = Math.max(0, poll.likesCount - 1);
    await poll.save();
    return res.status(200).json({ success: true, data: { liked: false, likesCount: poll.likesCount } });
  }

  await Like.create({ poll: poll._id, user: req.user._id });
  poll.likesCount += 1;
  await poll.save();

  if (String(poll.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: poll.author,
      sender: req.user._id,
      type: "poll_liked",
      poll: poll._id,
      message: `${req.user.name} liked your poll "${poll.title}"`,
    });
  }

  res.status(200).json({ success: true, data: { liked: true, likesCount: poll.likesCount } });
});
