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
      totalDate: filtered.length,
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

    if (!Array.isArray(pendingIds) || !pendingIds.length || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. 'pendingIds' (array) and 'status' (string) are required.",
      });
    }

    const approvals = await ApprovalWaiting.find({ _id: { $in: pendingIds } });
    if (!approvals.length) {
      return res.status(404).json({
        success: false,
        message: "No matching approval records found.",
      });
    }

    const groupedApprovals = {};
    approvals.forEach((approval) => {
      const key = approval.studycenterId.toString();
      if (!groupedApprovals[key])
        groupedApprovals[key] = { approvals: [], studyCenter: null };
      groupedApprovals[key].approvals.push(approval);
    });

    const studycenterIds = Object.keys(groupedApprovals);
    const studyCenters = await StudyCenter.find({
      _id: { $in: studycenterIds },
    });

    studyCenters.forEach((sc) => {
      const key = sc._id.toString();
      if (groupedApprovals[key]) {
        groupedApprovals[key].studyCenter = sc;
      }
    });

    let enrolledCount = 0;

    for (const centerId of studycenterIds) {
      const group = groupedApprovals[centerId];
      const studyCenter = group.studyCenter;

      if (!studyCenter || !studyCenter.atcId) {
        return res.status(400).json({
          success: false,
          message: `Study center (${centerId}) not found or invalid.`,
        });
      }

      const centerCode = studyCenter.atcId.slice(-4);

      const lastEnrollment = await enrollmentSchema
        .findOne({ studycenterId: centerId })
        .sort({ admissionNumber: -1 });

      let lastNumber = 1049;
      if (lastEnrollment) {
        const parsed = parseInt(lastEnrollment.admissionNumber.slice(4), 10);
        lastNumber = parsed;
        console.log(" last adminssion number:", lastNumber);
      }

      let nextNumber = lastNumber + 1;

      for (const approval of group.approvals) {
        if (status === "approved") {
          const admissionNumber = `${centerCode}${String(nextNumber).padStart(4, "0")}`;
          console.log("next Number :", nextNumber);
          nextNumber++;

          const enrollmentDoc = {
            studentId: approval.studentId,
            courseId: approval.courseId,
            batchId: approval.batchId,
            studycenterId: approval.studycenterId,
            year: approval.year,
            enrolledDate: approval.enrolledDate || new Date(),
            admissionNumber,
          };

         const createdEnrollment = await enrollmentSchema.create(enrollmentDoc);
          enrolledCount++;
            console.log("Created Enrollment:", createdEnrollment);
            if (createdEnrollment && createdEnrollment._id) {
              await ApprovalWaiting.deleteOne({ _id: approval._id });
              enrolledCount++;
            }
        } else {
          await ApprovalWaiting.updateOne(
            { _id: approval._id },
            { $set: { approvalStatus: status } }
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Status updated successfully. ${enrolledCount} enrolled.`,
    });
  } catch (error) {
    console.error("Error in updateStatusOfPendingApprovals:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




