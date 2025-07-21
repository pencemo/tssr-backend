import Course from "../models/courseSchema.js";
import RequestCourse from "../models/requestCourseSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";
import { sendNotification } from '../utils/notification.js'

// export const requestCourse = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const studycenterId = req.user.studycenterId;

//     if (!courseId) {
//       return res.status(400).json({
//         success: false,
//         message: "Course ID is required",
//       });
//     }

//     // Check if the course has already been requested by this study center
//     const existingRequest = await RequestCourse.findOne({
//       courseId,
//       studycenterId,
//     });

//     if (existingRequest) {
//       return res.status(400).json({
//         success: false,
//         message: "This course has already been requested by your study center",
//       });
//       }
      
//     const newRequest = await RequestCourse.create({
//       courseId,
//       studycenterId,
//     });
    
//       const studycenter = await StudyCenter.findById(studycenterId).select("name");
//       await sendNotification({
//         title: "New Request Received",
//         description: `A new request has been submitted by ${studycenter.name}.`,
//         receiverId: null,
//         category: "New Request",
//         receiverIsAdmin: true,
//       });
//     return res.status(201).json({
//       success: true,
//       message: "Course request submitted",
//       data: newRequest,
//     });
//   } catch (error) {
//     console.error("Error requesting course:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error. Could not process course request.",
//     });
//   }
// };


export const requestCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studycenterId = req.user.studycenterId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if the course has already been requested by this study center
    const existingRequest = await RequestCourse.findOne({
      courseId,
      studycenterId,
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          success: false,
          message:
            "You have already requested this course. Please wait for admin approval.",
        });
      }

      if (existingRequest.status === "approved") {
        return res.status(400).json({
          success: false,
          message: "This course is already approved for your study center.",
        });
      }

      if (existingRequest.status === "rejected") {
        // Reapply logic: change status back to pending and update request date
        existingRequest.status = "pending";
        existingRequest.requestedDate = new Date();
        await existingRequest.save();

        const studycenter =
          await StudyCenter.findById(studycenterId).select("name");

        await sendNotification({
          title: "Re-Request Submitted",
          description: `${studycenter.name} has reapplied for a previously rejected course.`,
          receiverId: null,
          category: "New Request",
          receiverIsAdmin: true,
        });

        return res.status(200).json({
          success: true,
          message: "Re-request submitted successfully",
          data: existingRequest,
        });
      }
    }

    // If no previous request exists, create a new one
    const newRequest = await RequestCourse.create({
      courseId,
      studycenterId,
    });

    const studycenter =
      await StudyCenter.findById(studycenterId).select("name");

    await sendNotification({
      title: "New Request Received",
      description: `A new request has been submitted by ${studycenter.name}.`,
      receiverId: null,
      category: "New Request",
      receiverIsAdmin: true,
    });

    return res.status(201).json({
      success: true,
      message: "Course request submitted",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error requesting course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not process course request.",
    });
  }
};


export const getRequestedCourses = async (req, res) => {
  try {
    const studycenterId = req.user.studycenterId;
    const requestedCourses = await RequestCourse.find({
      studycenterId,
    }).populate("courseId", "name");

    return res.status(200).json({
      success: true,
      message: "Requested courses retrieved successfully",
      data: requestedCourses,
    });
  } catch (error) {
    console.error("Error retrieving requested courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not retrieve requested courses.",
    });
  }
};

export const changeStatusOfRequestedCourse = async (req, res) => {
  try {
    const { requestId, status } = req.body;

   const isInclude = ["approved", "rejected"].includes(status);

    if (!isInclude) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Status must be 'approved' or 'rejected'",
      })
    }

    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request ID and status are required",
      });
    }

      
    const updatedRequest = await RequestCourse.findOneAndUpdate(
      { _id: requestId },
      { status },
      { new: true }
    ).populate("courseId","name");

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (status === "approved") {
      await StudyCenter.findByIdAndUpdate(updatedRequest.studycenterId, {
        $addToSet: { courses: updatedRequest.courseId._id },
      });
    }

      await sendNotification({
        title: `Request ${status}`,
        description: `Your request for "${updatedRequest?.courseId?.name}" has been ${status}. Please check the details or contact the admin if needed.`,
        category: "Request Update",
        receiverId: updatedRequest.studycenterId,
      });
    
    return res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not update request status.",
    });
  }
};

export const getRequestedCoursesByAdmin = async (req, res) => {
  try {
    const requestedCourses = await RequestCourse.find()
      .sort({ requestedDate: -1 })
      .populate("courseId", "name")
      .populate("studycenterId", "name");

    return res.status(200).json({
      success: true,
      message: "Requested courses retrieved successfully",
      data: requestedCourses,
    });
  } catch (error) {
    console.error("Error retrieving requested courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not retrieve requested courses.",
    });
  }
};

export const getAllNotBookedCourses = async (req, res) => {
  try {
    const studycenterId = req.user.studycenterId;

    if (!studycenterId) {
      return res.status(400).json({
        success: false,
        message: "Study center ID is required.",
      });
    }

    const studycenter = await StudyCenter.findById(studycenterId)
      .select("courses")
      .lean();

    if (!studycenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found.",
      });
    }

    const assignedCourseIds = studycenter.courses || [];

    // Use $nin to fetch only unassigned courses in a single query
    const unassignedCourses = await Course.find({
      _id: { $nin: assignedCourseIds },
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Unassigned (not booked) courses fetched successfully.",
      data: unassignedCourses,
    });
  } catch (error) {
    console.error("Error fetching unassigned courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not fetch unassigned courses.",
    });
  }
};


