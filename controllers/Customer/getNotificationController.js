const Notification = require("../../models/Notification");
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user.customerId
  }).sort({ createdAt: -1 });

  res.json({ notifications });
};
exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ success: true });
};

