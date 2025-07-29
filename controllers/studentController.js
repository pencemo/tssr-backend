import Enrollment from "../models/enrollmentSchema.js";
import { Types } from "mongoose";
import ApprovalWaiting from '../models/approvalWaitingSchema.js'
import Student from "../models/studentSchema.js";
import Course from "../models/courseSchema.js";
import batchSchema from "../models/batchSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";

export const getStudyCenterStudents = async (req, res) => {
  const user = req.user;
  let studycenterId;

  try {
    if (user.isAdmin) {
      studycenterId = req.query.studyCentre;
    } else {
      studycenterId = req.user.studycenterId;
    }

    // Convert query parameters to numbers
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const year = req.query.year ? parseInt(req.query.year) : undefined;

    const { batchId, courseId, search = "" } = req.query;

    // Convert string IDs to ObjectId
    const toObjectId = (id) => (id ? new Types.ObjectId(id) : null);

    // Base match stage for enrollments
    const matchStage = {};
    if (studycenterId) matchStage.studycenterId = toObjectId(studycenterId);
    if (batchId) matchStage.batchId = toObjectId(batchId);
    if (courseId) matchStage.courseId = toObjectId(courseId);
    if (year) matchStage.year = year;

    const aggregationPipeline = [
      // Initial match for enrollments
      { $match: matchStage },

      // Lookup student details
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },

      // Lookup batch details
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

      // Lookup course details
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

      // Lookup studycenter details
      {
        $lookup: {
          from: "studycenters",
          localField: "studycenterId",
          foreignField: "_id",
          as: "studycenter",
        },
      },
      { $unwind: { path: "$studycenter", preserveNullAndEmptyArrays: true } },

      // Apply search filter after all lookups
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "student.name": new RegExp(search, "i") },
                  { "student.phoneNumber": new RegExp(search, "i") },
                  { admissionNumber: new RegExp(search, "i") },
                ],
              },
            },
          ]
        : []),

      // Group by student only when not searching
      ...(!search
        ? [
            {
              $group: {
                _id: "$student._id",
                doc: { $first: "$$ROOT" },
              },
            },
            {
              $replaceRoot: { newRoot: "$doc" },
            },
          ]
        : []),
      // After $replaceRoot:
      { $sort: { admissionNumber: -1 } },

      // Project final fields
      {
        $project: {
          studentName: "$student.name",
          email: "$student.email",
          phoneNumber: "$student.phoneNumber",
          admissionNumber: "$admissionNumber",
          profileImage: "$student.profileImage",
          batchMonth: "$batch.month",
          courseName: "$course.name",
          studycenterName: "$studycenter.name",
          enrollmentId: "$_id",
          year: 1,
          createdAt: "$student.createdAt",
        },
      },

      // Pagination using facet
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const result = await Enrollment.aggregate(aggregationPipeline);

    const total = result[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = page;

    res.json({
      success: true,
      data: result[0]?.data || [],
      totalData: total,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getOneStudent = async (req, res) => {
  try {
    const { id, isEnrolled } = req.query;

    if (!id || typeof isEnrolled === "undefined") {
      return res.status(400).json({
        success: false,
        message: "'id' and 'isEnrolled' query parameters are required",
      });
    }

    let responseData;

    if (isEnrolled === "true") {
      // ✅ ENROLLED STUDENT
      const enrollment = await Enrollment.findById(id)
        .populate("studentId")
        .populate({ path: "batchId", select: "month" })
        .populate({ path: "studycenterId", select: "name" })
        .populate({ path: "courseId", select: "name" });

      if (!enrollment) {
        return res
          .status(404)
          .json({ success: false, message: "Enrollment not found" });
      }

      const {
        studentId,
        batchId,
        studycenterId,
        courseId,
        admissionNumber,
        ...rest
      } = enrollment._doc;

      responseData = {
        ...rest,
        ...studentId._doc,
        admissionNumber,
        studycenter: studycenterId?.name || "",
        batchMonth: batchId?.month || "",
        ourseName: courseId?.name || "",
      };
    } else {
      // ✅ PENDING STUDENT
      const approval = await ApprovalWaiting.findById(id);

      if (!approval) {
        return res
          .status(404)
          .json({ success: false, message: "Pending approval not found" });
      }

      const [student, course, batch, studycenter] = await Promise.all([
        Student.findById(approval.studentId),
        Course.findById(approval.courseId),
        batchSchema.findById(approval.batchId),
        StudyCenter.findById(approval.studycenterId),
      ]);

      if (!student || !course) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Related student or course not found",
          });
      }

      responseData = {
        _id: student._id,
        year: approval.year,
        enrolledDate: approval.enrolledDate || new Date(),
        isCompleted: "Waiting for approval",
        isPassed: "Waiting for approval",
        isCertificateIssued: "Waiting for approval",
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt,
        __v: approval.__v,
        name: student.name,
        age: student.age,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phoneNumber: student.phoneNumber,
        place: student.place,
        district: student.district,
        state: student.state,
        pincode: student.pincode,
        email: student.email,
        adhaarNumber: student.adhaarNumber,
        studyCenterId: approval.studycenterId,
        admissionNumber: "Waiting for approval",
        dateOfAdmission: student.dateOfAdmission || approval.createdAt,
        parentName: student.parentName,
        qualification: student.qualification,
        sslc: student.sslc,
        profileImage: student.profileImage,
        studentId: student.studentId,
        studycenter: studycenter?.name || "",
        batchMonth: batch?.month || "",
        courseName: course.name,
      };
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getStudentsForDl = async (req, res) => {
  try {
    const studycenterId = req.user?.studycenterId || req.body.studycenterId;

    if (!req.user.isAdmin) {
      if (req.user.studycenterId == null) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Study center ID is required.",
        });
      }
    }
    const { courseId, batchId, year, fields } = req.body || {};

    const query = {};
    if (studycenterId) query.studycenterId = studycenterId;
    if (courseId) query.courseId = courseId;
    if (batchId) query.batchId = batchId;
    if (year) query.year = year;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "studentId",
        select: fields ? fields.join(" ") : "",
      })
      .populate({ path: "batchId", select: "month admissionYear" })
      .populate({ path: "courseId", select: "name" })
      .populate({ path: "studycenterId", select: "name" });

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No enrollments found for the given criteria.",
      });
    }

    const formattedData = enrollments
      .map((en) => {
        const {
          studentId,
          batchId,
          courseId,
          year,
          enrolledDate,
          isPassed,
          isCompleted,
        } = en._doc;

        if (!studentId || !studentId._doc) {
          return null;
        }

        const { _id, ...studentData } = studentId._doc;

        return {
          ...studentData,
          year,
          enrolledDate,
          isCompleted: isCompleted ? "Completed" : "Not Completed",
          isPassed: isPassed ? "Passed" : "Not Passed",
          batchMonth: batchId?.month || "",
          courseName: courseId?.name || "",
          admissionNumber: en.admissionNumber || "",
          ...(req.user.isAdmin && {
            studycenterName: en.studycenterId?.name || "",
          }),
        };
      })
      .filter(Boolean); // Remove nulls

    // ✅ Sort students by name always, and by studycenterName only if needed
    formattedData.sort((a, b) => {
      if (req.user.isAdmin && !req.body.studycenterId) {
        const centerCompare = (a.studycenterName || "").localeCompare(
          b.studycenterName || ""
        );
        if (centerCompare !== 0) return centerCompare;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
      studycenterName: studycenterId
        ? enrollments[0]?.studycenterId?.name
        : "All Study Centers",

      courseName: courseId ? enrollments[0].courseId.name : "All Courses",
      batchMonth: batchId ? enrollments[0].batchId.month : "All Batches",
      year: year || "All Years",
    });
  } catch (error) {
    console.error("Failed to fetch students for download:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllStudentsDownloadForAdmin = async (req, res) => {
  try {
    const { courseId, batchId, year, fields } = req.body || {};

    const query = {};
    if (courseId) query.courseId = courseId;
    if (batchId) query.batchId = batchId;
    if (year) query.year = year;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "studentId",
        select: fields ? fields.join(" ") : "",
      })
      .populate({ path: "batchId", select: "month admissionYear" })
      .populate({ path: "courseId", select: "name" })
      .populate({ path: "studycenterId", select: "name" });

    if (!enrollments.length) {
      return res
        .status(404)
        .json({ success: false, message: "No enrollments found." });
    }

    // Group by studycenterId
    const groupedByCenter = {};

    for (const en of enrollments) {
      const centerId = en.studycenterId?._id?.toString() || "unknown";
      const centerName = en.studycenterId?.name || "Unknown Study Center";

      if (!en.studentId || !en.studentId._doc) continue;

      const { _id, ...studentData } = en.studentId._doc;

      const formatted = {
        ...studentData,
        year: en.year,
        enrolledDate: en.enrolledDate,
        isCompleted: en.isCompleted ? "Completed" : "Not Completed",
        isPassed: en.isPassed ? "Passed" : "Not Passed",
        batchMonth: en.batchId?.month || "",
        courseName: en.courseId?.name || "",
      };

      if (!groupedByCenter[centerId]) {
        groupedByCenter[centerId] = {
          studycenterId: centerId,
          studycenterName: centerName,
          students: [],
        };
      }

      groupedByCenter[centerId].students.push(formatted);
    }

    return res.status(200).json({
      success: true,
      data: Object.values(groupedByCenter),
      courseName: courseId ? enrollments[0].courseId.name : "All Courses",
      batchMonth: batchId ? enrollments[0].batchId.month : "All Batches",
      year: year || "All Years",
    });
  } catch (error) {
    console.error("Error in getAllEnrollmentsGroupedByStudyCenter:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateStudentById = async (req, res) => {
  try {
    const { id, approvalId, ...restData } = req.body.data;
    const isEnrolled = req.body.data.isEnrolled === "true";

    const updatedData = {
      name: restData.name,
      age: restData.age,
      gender: restData.gender,
      dateOfBirth: restData.dateOfBirth
        ? new Date(restData.dateOfBirth)
        : undefined,
      phoneNumber: restData.phoneNumber,
      email: restData.email,
      place: restData.place,
      state: restData.state,
      district: restData.district,
      pincode: restData.pincode,
      parentName: restData.parentName,
      qualification: restData.qualification,
      adhaarNumber: restData.adhaarNumber,
      dateOfAdmission: restData.dateOfAdmission
        ? new Date(restData.dateOfAdmission)
        : undefined,
      profileImage: restData.profileImage,
      sslc: restData.sslc,
    };

    // Remove undefined values
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) delete updatedData[key];
    });

    // ✅ Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
      }
    );


    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // ✅ If not enrolled, update approval status
    if (!isEnrolled && approvalId) {
      const approval = await ApprovalWaiting.findByIdAndUpdate(
        approvalId,
        { approvalStatus: "pending" },
        { new: true }
      );
      if (!approval) {
        return res
          .status(404)
          .json({ success: false, message: "Approval record not found" });
      }
    }

    return res.status(200).json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
