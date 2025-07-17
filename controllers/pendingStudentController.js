import mongoose from "mongoose";
import ApprovalWaiting from "../models/approvalWaitingSchema.js";

export const getPendingAndRejectedStudents = async (req, res) => {
  try {
    const {
      search = "",
      studyCentre,
      page = 1,
      limit = 10,
      status, // must be "pending" or "rejected"
    } = req.query;

    const { isAdmin, studycenterId: userStudyCenterId } = req.user;
    let studycenterId;

    // Validate status filter
    if (!["pending", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status. Use 'pending' or 'rejected'.",
      });
    }

    // Determine studycenterId
    if (isAdmin) {
      if (studyCentre && mongoose.Types.ObjectId.isValid(studyCentre)) {
        studycenterId = studyCentre;
      }
    } else {
      if (
        !userStudyCenterId ||
        !mongoose.Types.ObjectId.isValid(userStudyCenterId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing studycenterId for studycenter user.",
        });
      }
      studycenterId = userStudyCenterId;
    }

    // Build filter
    const filter = {
      approvalStatus: status,
    };
    if (studycenterId) {
      filter.studycenterId = new mongoose.Types.ObjectId(studycenterId);
    }

    // Fetch data
    const approvals = await ApprovalWaiting.find(filter)
      .populate("studentId", "name phoneNumber email adhaarNumber gender")
      .populate("courseId", "name duration")
      .populate("batchId", "batchName admissionYear")
      .populate("studycenterId", "name");

    // Apply search
    const searchRegex = new RegExp(search, "i");
    const filtered = approvals.filter(
      (item) =>
        searchRegex.test(item?.studentId?.name || "") ||
        searchRegex.test(item?.courseId?.name || "") ||
        searchRegex.test(item?.studycenterId?.name || "")
    );

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(filtered.length / limitNum);
    const paginatedStudents = filtered.slice(startIndex, startIndex + limitNum);

    // Final response
    return res.status(200).json({
      success: true,
      message: `Fetched ${status} students.`,
      currentPage: pageNum,
      totalPages,
      students: paginatedStudents,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


