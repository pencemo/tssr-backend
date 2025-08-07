

import Enrollment from "../models/enrollmentSchema.js";
import ExamSchedule from "../models/examScheduleSchema.js";
import jwt from 'jsonwebtoken';
import { getDurationFromTimeRange } from "../utils/getDurationFromTime.js";


export const hallTicketDownload = async (req, res) => {
  try {
    const { admissionNumber, dob } = req.body;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required",
      });
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

      if (dob) {
        const providedDOB = new Date(dob);
        const actualDOB = new Date(student.dateOfBirth);

        const toLocalDateString = (date) => {
          return date.toLocaleDateString("en-CA");
        };

        const providedDate = toLocalDateString(providedDOB);
        const actualDate = toLocalDateString(actualDOB);

        // console.log("Provided Date:", providedDate);
        // console.log("Actual Date:", actualDate);

        if (providedDate !== actualDate) {
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

    const duration = getDurationFromTimeRange(
      examSchedule.examTime.from,
      examSchedule.examTime.to
    );

    return res.status(200).json({
      success: true,
      message: "Hall ticket approved",
      data: {
        studentName: student.name,
        studentId: student._id,
        email: student.email,
        adhaarNumber: student.adhaarNumber,
        registrationNo: admissionNumber,
        courseName: course.name,
        courseCode: course.courseId,
        profileImage: student.profileImage,
        studyCenter: studyCenter.name,
        examName: examSchedule.examName,
        examDate: examSchedule.examDate,
        examTime: examSchedule.examTime,
        examCenter: examCenterLocation,
        duration,
      },
    });
  } catch (error) {
    console.error("Error generating hall ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating hall ticket",
      error: error.message,
    });
  }
};
