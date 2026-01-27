import Notification from "../models/notificationModel.js";

/* GET NOTIFICATIONS (DO NOT MARK READ HERE) */
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: notifications });
};

/* MARK ALL AS READ */
export const markNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({ success: true });
};
