import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route GET /api/users/:username
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new ApiError(404, "User not found.");

  const pollsCount = await Poll.countDocuments({ author: user._id, status: "published" });

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      stats: {
        pollsCount,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    },
  });
});

// @route PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const editableFields = ["name", "bio", "socialLinks"];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});

// @route PUT /api/users/me/avatar  (multer attaches req.file via Cloudinary storage)
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image uploaded.");
  req.user.avatar = { url: req.file.path, publicId: req.file.filename };
  await req.user.save();
  res.status(200).json({ success: true, data: { avatar: req.user.avatar } });
});

// @route PUT /api/users/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  res.status(200).json({ success: true, message: "Password changed. Please log in again." });
});

// @route GET /api/users/me/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalPolls, myPolls, myVotesCount] = await Promise.all([
    Poll.countDocuments({ author: userId }),
    Poll.find({ author: userId }).sort({ createdAt: -1 }).limit(5),
    Vote.countDocuments({ voter: userId }),
  ]);

  const totalVotesReceived = await Poll.aggregate([
    { $match: { author: userId } },
    { $group: { _id: null, sum: { $sum: "$totalVotes" } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalPolls,
        totalVotesCast: myVotesCount,
        totalVotesReceived: totalVotesReceived[0]?.sum || 0,
        followers: req.user.followers.length,
        following: req.user.following.length,
        savedPolls: req.user.savedPolls.length,
      },
      recentPolls: myPolls,
    },
  });
});

// @route POST /api/users/:id/follow — toggles follow on/off
export const toggleFollow = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, "User not found.");

  const isFollowing = req.user.following.some((id) => String(id) === String(target._id));

  if (isFollowing) {
    req.user.following = req.user.following.filter((id) => String(id) !== String(target._id));
    target.followers = target.followers.filter((id) => String(id) !== String(req.user._id));
  } else {
    req.user.following.push(target._id);
    target.followers.push(req.user._id);
  }

  await Promise.all([req.user.save(), target.save()]);

  res.status(200).json({ success: true, data: { following: !isFollowing } });
});
