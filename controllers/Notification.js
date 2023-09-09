import { notificationModel } from "../models/Notification.js";
import { usersModel } from "../models/Users.js";

export const notify = async (req, res) => {
  const { id, notiMsg } = req.body;
  const notificationObj = await notificationModel.create({
    userID: id,
    notification: notiMsg,
  });
  if (!notificationObj) {
    return res
      .status(404)
      .json({ success: false, message: "Failed to notify user !" });
  }
  res.status(200).json({ success: true, message: "Notified User !" });
};
export const notifyAll = async (req, res) => {
  try {
    const { notiMsg } = req.body;
    const users = await usersModel.find({});
    if (users.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Failed to notify all users !" });
    }
    for (const user of users) {
      await notificationModel.create({
        userID: user._id,
        notification: notiMsg,
      });
    }
    res.status(200).json({ success: true, message: "Users Notified !" });
  } catch (e) {
    return res
      .status(404)
      .json({ success: false, message: "Failed to notify all users !" });
  }
};
export const deleteOld = async (req, res) => {
  try {
    const length = await notificationModel.countDocuments({});
    if (length > 0) {
      const currentTime = new Date();
      const threeHoursAgo = new Date(currentTime - 5 * 60 * 1000); // 5 min
      const result = await notificationModel.deleteMany({
        createdAt: { $lt: threeHoursAgo },
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Old Notifications Deleted !" });
  } catch (error) {
    return res
      .status(404)
      .json({ success: false, message: "Failed to delete !" });
  }
};
