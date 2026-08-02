import mongoose from "mongoose";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getIO } from "../socket.js";

const emitPollUpdate = (poll) => {
  const io = getIO();
  if (!io) return;
  io.to(`poll:${String(poll._id)}`).emit("poll:update", {
    pollId: String(poll._id),
    totalVotes: poll.totalVotes,
    options: poll.options.map((o) => ({ _id: o._id, votesCount: o.votesCount })),
  });
};

// @route POST /api/polls/:id/vote
export const castVote = asyncHandler(async (req, res) => {
  const { selectedOptions } = req.body;
  const poll = await Poll.findById(req.params.id);

  if (!poll) throw new ApiError(404, "Poll not found.");
  if (poll.status !== "published") throw new ApiError(400, "This poll is not accepting votes.");
  if (poll.expiresAt && new Date() > poll.expiresAt) {
    throw new ApiError(400, "This poll has expired.");
  }
  if (poll.type !== "multiple" && selectedOptions.length > 1) {
    throw new ApiError(400, "Only one option can be selected for this poll type.");
  }

  const validIds = poll.options.map((o) => String(o._id));
  const allValid = selectedOptions.every((id) => validIds.includes(String(id)));
  if (!allValid) throw new ApiError(400, "One or more selected options are invalid.");

  // Vote model's unique (poll, voter) index prevents duplicate votes at the DB level
  let vote;
  try {
    vote = await Vote.create({
      poll: poll._id,
      voter: req.user._id,
      selectedOptions,
    });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You have already voted on this poll.");
    throw err;
  }

  poll.options.forEach((opt) => {
    if (selectedOptions.map(String).includes(String(opt._id))) {
      opt.votesCount += 1;
    }
  });
  poll.totalVotes += 1;
  await poll.save();

  if (String(poll.author) !== String(req.user._id) && !poll.isAnonymous) {
    await Notification.create({
      recipient: poll.author,
      sender: req.user._id,
      type: "new_vote",
      poll: poll._id,
      message: `${req.user.name} voted on your poll "${poll.title}"`,
    });
  }

  emitPollUpdate(poll);

  res.status(201).json({ success: true, data: { vote, poll } });
});

// @route POST /api/polls/:id/unvote
export const removeVote = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");

  const vote = await Vote.findOne({ poll: poll._id, voter: req.user._id });
  if (!vote) throw new ApiError(400, "You have not voted on this poll.");

  const selected = vote.selectedOptions.map((id) => String(id));
  poll.options.forEach((opt) => {
    if (selected.includes(String(opt._id))) {
      opt.votesCount = Math.max(0, (opt.votesCount || 0) - 1);
    }
  });
  poll.totalVotes = Math.max(0, poll.totalVotes - 1);

  await Promise.all([vote.deleteOne(), poll.save()]);

  emitPollUpdate(poll);

  res.status(200).json({ success: true, data: { poll } });
});

// @route GET /api/polls/:id/results
export const getPollResults = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id).select("title options totalVotes type");
  if (!poll) throw new ApiError(404, "Poll not found.");

  const results = poll.options.map((opt) => ({
    optionId: opt._id,
    text: opt.text,
    votesCount: opt.votesCount,
    percentage: poll.totalVotes > 0 ? Number(((opt.votesCount / poll.totalVotes) * 100).toFixed(1)) : 0,
  }));

  res.status(200).json({
    success: true,
    data: { pollId: poll._id, title: poll.title, totalVotes: poll.totalVotes, results },
  });
});

// @route GET /api/users/me/votes  — a user's vote history
export const getMyVotes = asyncHandler(async (req, res) => {
  const votes = await Vote.find({ voter: req.user._id })
    .populate({ path: "poll", select: "title totalVotes status expiresAt" })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { votes } });
});
