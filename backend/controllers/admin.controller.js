import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Report from "../models/Report.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route GET /api/admin/dashboard
export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPolls, totalVotes, pendingReports] = await Promise.all([
    User.countDocuments(),
    Poll.countDocuments(),
    Poll.aggregate([{ $group: { _id: null, sum: { $sum: "$totalVotes" } } }]),
    Report.countDocuments({ status: "pending" }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalPolls,
      totalVotes: totalVotes[0]?.sum || 0,
      pendingReports,
    },
  });
});

// @route GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search
    ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
    : {};

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);

  res.status(200).json({ success: true, data: { users, total } });
});

// @route PATCH /api/admin/users/:id/ban
export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  user.isBanned = !user.isBanned;
  await user.save();
  res.status(200).json({ success: true, data: { isBanned: user.isBanned } });
});

// @route GET /api/admin/polls
export const listAllPolls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const polls = await Poll.find()
    .populate("author", "name username")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Poll.countDocuments();
  res.status(200).json({ success: true, data: { polls, total } });
});

// @route DELETE /api/admin/polls/:id
export const adminDeletePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");
  await poll.deleteOne();
  res.status(200).json({ success: true, message: "Poll removed." });
});

// @route GET /api/admin/reports
export const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ status: "pending" })
    .populate("poll", "title")
    .populate("reportedBy", "name username")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { reports } });
});

// @route PATCH /api/admin/reports/:id
export const resolveReport = asyncHandler(async (req, res) => {
  const { status } = req.body; // "reviewed" | "dismissed"
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found.");
  report.status = status;
  await report.save();
  res.status(200).json({ success: true, data: { report } });
});

// @route POST /api/polls/:id/report  (used by regular users, defined here for cohesion)
export const createReport = asyncHandler(async (req, res) => {
  const { reason, details } = req.body;
  const report = await Report.create({
    poll: req.params.id,
    reportedBy: req.user._id,
    reason,
    details,
  });
  res.status(201).json({ success: true, data: { report } });
});
