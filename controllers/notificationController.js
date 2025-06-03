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
    const user = req.user;
    try {
        let notifications = [];
        if (!user.isAdmin) {
            notifications = await Notification.find({
              receiverIsAdmin: false,
              $or: [
                { receiverId: { $in: [user.studycenterId] } },
                { receiverId: { $size: 0 } }, // Match empty arrays
              ],
            })
              .select("-receiverId")
              .sort({ createdAt: -1 })
                .exec();
        } else {
            notifications =  await Notification.find({
              receiverIsAdmin:true,
            })
              .select("-receiverId")
                .sort({ createdAt: -1 })
        }

      return res.status(200).json({
        success: true,
        data: notifications,
        message:"Notifications fetched successfully"
      });
        
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching notifications.",
      });
    }
}
