import NotificationSchema from "../models/NotificationSchema.js";

export const sendNotification = async ({
  title,
  description,
  receiverId,
  category,
  receiverIsAdmin=false
}) => {
  try {
    const newNotification = new NotificationSchema({
      title,
      description,
      receiverId,
      category,
      receiverIsAdmin,
    });
    const saved = await newNotification.save();
    return saved;
  } catch (error) {
    console.error("Notification Error:", error.message);
    throw new Error("Failed to send notification");
  }
};
