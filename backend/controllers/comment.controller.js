import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route POST /api/polls/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");

  const comment = await Comment.create({
    poll: poll._id,
    author: req.user._id,
    content,
    parentComment: parentComment || null,
  });

  poll.commentsCount += 1;
  await poll.save();

  if (String(poll.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: poll.author,
      sender: req.user._id,
      type: "new_comment",
      poll: poll._id,
      message: `${req.user.name} commented on your poll "${poll.title}"`,
    });
  }

  await comment.populate("author", "name username avatar");
  res.status(201).json({ success: true, data: { comment } });
});

// @route GET /api/polls/:id/comments
export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ poll: req.params.id, isDeleted: false })
    .populate("author", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { comments } });
});

// @route DELETE /api/polls/:id/comments/:commentId
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, "Comment not found.");

  const poll = await Poll.findById(req.params.id);
  const isOwner = String(comment.author) === String(req.user._id);
  const isPollAuthor = poll && String(poll.author) === String(req.user._id);

  if (!isOwner && !isPollAuthor && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot delete this comment.");
  }

  comment.isDeleted = true;
  comment.content = "[deleted]";
  await comment.save();

  if (poll) {
    poll.commentsCount = Math.max(0, poll.commentsCount - 1);
    await poll.save();
  }

  res.status(200).json({ success: true, message: "Comment deleted." });
});
