import mongoose from "mongoose";
import ApprovalWaiting from "../models/approvalWaitingSchema.js";
import enrollmentSchema from "../models/enrollmentSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";

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
      .populate(
        "studentId",
        "name phoneNumber email adhaarNumber gender profileImage"
      )
      .populate("courseId", "name duration")
      .populate("batchId", "month admissionYear")
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


export const updateStatusOfPendingApprovals = async (req, res) => {
  try {
    const { pendingIds, status } = req.body;

    // Validate inputs
    if (!Array.isArray(pendingIds) || !pendingIds.length || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. 'pendingIds' (array) and 'status' (string) are required.",
      });
    }


    // Step 1: Fetch Approval Records
    const approvals = await ApprovalWaiting.find({
      _id: { $in: pendingIds },
    });

    if (!approvals.length) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No matching approval records found.",
        });
    }

    // Step 2: Update Approval Status
    await ApprovalWaiting.updateMany(
      { _id: { $in: pendingIds } },
      { $set: { approvalStatus: status } }
    );

    // Step 3: Create Enrollments only if status is 'approved'
    let enrolledCount = 0;
if (status === "approved") {
  const enrollmentDocs = [];

  for (const approval of approvals) {
    const studyCenter = await StudyCenter.findById(approval.studycenterId);
    if (!studyCenter || !studyCenter.atcId) {
      continue; 
    }

    const atcId = studyCenter.atcId;
    const centerCode = atcId.slice(-4); 


    const lastEnrollment = await enrollmentSchema
      .findOne({
        studycenterId: approval.studycenterId,
      })
      .sort({ createdAt: -1 });

    let nextNumber = 1050;
    if (lastEnrollment) {
      const lastNumber = parseInt(
        lastEnrollment.admissionNumber.slice(4),
        10
      );
      nextNumber = lastNumber + 1;
    }

    const registrationNumber = `${centerCode}${String(nextNumber).padStart(4, "0")}`;

    enrollmentDocs.push({
      studentId: approval.studentId,
      courseId: approval.courseId,
      batchId: approval.batchId,
      studycenterId: approval.studycenterId,
      year: approval.year,
      enrolledDate: approval.enrolledDate || new Date(),
      admissionNumber:registrationNumber, 
    });
  }

  if (enrollmentDocs.length) {
    const inserted = await enrollmentSchema.insertMany(enrollmentDocs, {
      ordered: false,
    });
    enrolledCount = inserted.length;
  }

  // Remove processed approvals
  await ApprovalWaiting.deleteMany({ _id: { $in: pendingIds } });
}
    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
    });
  } catch (error) {
    console.error("Error in approveAndEnrollStudents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

