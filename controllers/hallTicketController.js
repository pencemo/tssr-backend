

import Enrollment from "../models/enrollmentSchema.js";
import ExamSchedule from "../models/examScheduleSchema.js";
import jwt from 'jsonwebtoken';

export const hallTicketDownload = async (req, res) => {
  try {
    const { admissionNumber, dob } = req.body;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required",
      });
    }

    const token = req.cookies?.token;
    let user = {};
    if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = {
        id: decoded.id,
        isAdmin: decoded.isAdmin,
        studycenterId: decoded.studycenterId,
      };
    }

    const enrollment = await Enrollment.findOne({ admissionNumber })
      .populate("batchId courseId studentId studycenterId")
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const {
      studentId: student,
      batchId: batch,
      courseId: course,
      studycenterId: studyCenter,
    } = enrollment;

    if (!user.studycenterId) {
      if (!dob ) {
        return res.status(400).json({
          success: false,
          message: "Date of birth is required",
        });
      }
      
      const providedDOB = new Date(dob).toDateString();
      const actualDOB = new Date(student.dateOfBirth).toDateString();

      console.log("Provided DOB:", providedDOB);
      console.log("Actual DOB:", actualDOB);

      if (providedDOB !== actualDOB) {
        return res.status(401).json({
          success: false,
          message: "Date of birth does not match our records",
        });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examSchedule = await ExamSchedule.findOne({
      batches: { $in: [batch._id] },
      "examDate.to": { $gte: today },
    })
      .select("examName examDate examTime changedCenters")
      .lean();

    if (!examSchedule) {
      return res.status(403).json({
        success: false,
        message: "No upcoming exam scheduled for this student's batch",
      });
    }

    const centerOverride = examSchedule.changedCenters?.find(
      (c) => c.centerId?.toString() === studyCenter._id.toString()
    );

    const examCenterLocation = centerOverride?.newLocation || studyCenter.name;

    return res.status(200).json({
      success: true,
      message: "Hall ticket approved",
      data: {
        studentName: student.name,
        registrationNo: admissionNumber,
        courseName: course.name,
        profileImage: student.profileImage,
        studyCenter: studyCenter.name,
        examName: examSchedule.examName,
        examDate: examSchedule.examDate,
        examTime: examSchedule.examTime,
        examCenter: examCenterLocation,
      },
    });
  } catch (error) {
    console.error("Error generating hall ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating hall ticket",
    });
  }
};
