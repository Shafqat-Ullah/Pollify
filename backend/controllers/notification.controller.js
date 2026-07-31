import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({ success: true, data: { notifications, unreadCount } });
});

// @route PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.status(200).json({ success: true });
});

// @route PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true });
});
