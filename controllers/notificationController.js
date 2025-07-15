import Notification from "../models/NotificationSchema.js";

export const createNotification = async (req, res) => {
  const { title, description, attachedFileUrl, category, receiverId } =
    req.body;
  try {
    if (!title || !description) {
      return res.json({
        message: "Please provide all required fields",
        success: false,
      });
    }
    const newNotification = new Notification({
      title,
      description,
      attachedFileUrl,
      receiverId,
      category,
      receiverIsAdmin: false,
    });

    await newNotification.save();
    res.status(201).json({
      success: true,
      message: "Notification created successfully!",
      data: newNotification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating notification.",
    });
  }
};

export const getNotificationsOfEachUser = async (req, res) => {
  try {
    const { isAdmin, studycenterId } = req.user;

    const query = isAdmin
      ? { receiverIsAdmin: true }
      : {
          receiverIsAdmin: false,
          $or: [
            { receiverId: { $in: [studycenterId] } },
            { receiverId: { $size: 0 } },
          ],
        };

    const notifications = await Notification.find(query)
      .select("-receiverId")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      data: notifications,
      message: "Notifications fetched successfully",
    });
  } catch (error) {
    console.error("Notification Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

export const getNotificationsForEdit = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiverIsAdmin: false,
    })
      .populate({
        path: "receiverId",
        select: "name", // Only return the name of the studycenter
        options: { lean: true },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    console.log("Notifications:", notifications.length);

    return res.status(200).json({
      success: true,
      data: notifications,
      message: "User notifications fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Notification ID:", id);

    // Optional: Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification.",
    });
  }
};