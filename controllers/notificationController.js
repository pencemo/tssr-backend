import Notification from "../models/NotificationSchema.js";


export const createNotification = async (req, res) => {
  const { title, description, attachedFileUrl,category,receiverId } =req.body;
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
      receiverIsAdmin:false,
    });
      
    await newNotification.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Notification created successfully!",
        data: newNotification,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
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
