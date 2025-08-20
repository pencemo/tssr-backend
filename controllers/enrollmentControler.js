import Student from "../models/studentSchema.js";
import Enrollment from "../models/enrollmentSchema.js";
import { getDateOnlyFromDate } from "../utils/dateUtils.js";
import Batch from "../models/batchSchema.js";
import enrollmentSchema from "../models/enrollmentSchema.js";
import { excelSerialToDate } from "../utils/excelDateTojsonDate.js";
import ApprovalWaiting from '../models/approvalWaitingSchema.js'
import mongoose from "mongoose";
import { normalizeDobToUTC } from "../utils/DOBConvertion.js";

export const checkEnrollmentByAdhar = async (req, res) => {
  try {
    const { adhaarNumber, courseId, batchId } = req.body;

    if (!adhaarNumber) {
      return res.status(400).json({
        data: {
          studentExists: false,
          enrolled: false,
          student: null,
          message: "Aadhaar number is required.",
        },
        success: false,
      });
    }

    
    const student = await Student.findOne({ adhaarNumber: adhaarNumber });

    if (!student) {
      return res.status(200).json({
        data: {
          studentExists: false,
          enrolled: false,
          student: null,
          message: "Student with this Aadhaar number does not exist.",
        },
        success: true,
      });
    }

    // Step 2: Count active enrollments
    const enrollments = await Enrollment.countDocuments({
      studentId: student._id,
      isCompleted: false,
    });

    // Step 3: Count pending approvals
    const pendingApprovals = await ApprovalWaiting.countDocuments({
      studentId: student._id,
      approvalStatus: "pending",
    });

    const totalCourses = enrollments + pendingApprovals;
    if (totalCourses >= 2) {
      return res.status(200).json({
        data: {
          studentExists: true,
          enrolled: true,
          student,
          message:
            "Student is already enrolled or applied for 2 active courses.",
        },
        success: false,
      });
    }

    if (courseId) {
      const alreadyEnrolled = await Enrollment.findOne({
        studentId: student._id,
        courseId,
        // batchId
        isCompleted: false,
      });

      const alreadyApplied = await ApprovalWaiting.findOne({
        studentId: student._id,
        courseId,
        approvalStatus: "pending",
      });
      if (alreadyEnrolled || alreadyApplied) {
        return res.status(200).json({
          data: {
            studentExists: true,
            enrolled: true,
            student,
          },
          success: false,
          message:
            "Student has already enrolled or applied for this course in the selected batch.",
        });
      }
    }

    return res.status(200).json({
      data: {
        studentExists: true,
        enrolled: false,
        student,
      },
      success: true,
      message: "Proceed with new Enrollment.",
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return res.status(500).json({
      data: {
        studentExists: false,
        enrolled: false,
        student: null,
      },
      success: false,
      message: "Internal server error",
    });
  }
};

export const createStudentWithEnrollment = async (req, res) => {
  try {
    const studyCenterId = req.user.studycenterId;
    const studentData = req.body.student;
    const course = req.body.course;
    const formatedDOB = normalizeDobToUTC(studentData.dateOfBirth);


    const {
      name,
      age,
      gender,
      phoneNumber,
      place,
      state,
      district,
      pincode,
      email,
      adhaarNumber,
      dateOfAdmission,
      parentName,
      qualification,
      sslc,
      profileImage,
    } = studentData;

    const { courseId, batchId } = course;

    if (!adhaarNumber || !courseId || !batchId ) {
      return res.status(400).json({
        message: "Aadhaar number, courseId, batchId, and year are required.",
        success: false,
      });
    }

    let student = await Student.findOne({ adhaarNumber });

if (!student) {
  const namePart = (name || "").substring(0, 3).toUpperCase();
  const phonePart = phoneNumber?.toString().slice(-3) || "000";
  const pinPart = pincode?.toString().slice(-3) || "000";
  const customStudentId = `${namePart}/${phonePart}/${pinPart}`;

  const newStudent = new Student({
    name,
    age,
    dateOfBirth:formatedDOB,
    gender,
    phoneNumber,
    place,
    state,
    district,
    pincode,
    email,
    adhaarNumber,
    dateOfAdmission,
    parentName,
    qualification,
    studentId: customStudentId,
    sslc,
    profileImage,
  });

  student = await newStudent.save();
}
    const batch = await Batch.findOne({_id: batchId});
    const newApproval = new ApprovalWaiting({
      studentId: student._id,
      courseId,
      batchId,
      year: batch?.admissionYear,
      studycenterId: studyCenterId,
      enrolledDate: new Date(),
      approvalStatus: "pending",
    });

    await newApproval.save();


    return res.status(201).json({
      message: "Student and enrollment created successfully.",
      student,
      enrollment: newApproval,
      success: true,
    });
  } catch (error) {
    console.error("Error in student with enrollment creation:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

export const EnrollExcelStudents = async (req, res) => {
  try {
    const data = req.body?.data;
    const courseId = req.body?.course?.courseId;
    const batchId = req.body?.course?.batchId;


    const REQUIRED_FIELDS = [
      "name",
      "age",
      "dateOfBirth",
      "gender",
      "phoneNumber",
      "place",
      "district",
      "state",
      "pincode",
      "email",
      "adhaarNumber",
      "parentName",
      "qualification",
    ];

    const newStudents = [];
    const pendingEnrollmentStudents = [];
    const unavailableStudents = [];
    const aadhaarSeen = new Set();

    for (const entry of data) {
      const adhaar = entry.adhaarNumber?.toString().trim();




      if (aadhaarSeen.has(adhaar)) {
        unavailableStudents.push({
          ...entry,
          reason: "Duplicate Aadhaar number found in sheet.",
        });
        continue;
      } else {
        aadhaarSeen.add(adhaar);
      }

      if (!adhaar || adhaar.length !== 12) {
        unavailableStudents.push({
          ...entry,
          reason: "Invalid Aadhaar number",
        });
        continue;
      }

      if (entry.dateOfBirth) {
        const isNumber = !isNaN(Number(entry.dateOfBirth));

        if (!isNumber) {
          unavailableStudents.push({
            ...entry,
            reason: "Invalid Date of Birth format in sheet.",
          });
          continue;
        }
      }

      const student = await Student.findOne({ adhaarNumber: adhaar });

      if (student) {
        const enrollments = await enrollmentSchema.countDocuments({
          studentId: student._id,
          isCompleted: false,
        });

        const approvals = await ApprovalWaiting.countDocuments({
          studentId: student._id,
          approvalStatus: "pending",
        });

        const totalActive = enrollments + approvals;

        if (totalActive >= 2) {
          unavailableStudents.push({
            ...entry,
            studentId: student._id,
            reason: "Student is already enrolled/applied for 2 active courses",
          });
          continue;
        }

        const alreadyEnrolled = await enrollmentSchema.findOne({
          studentId: student._id,
          courseId,
          isCompleted: false,
        });

        const alreadyApplied = await ApprovalWaiting.findOne({
          studentId: student._id,
          courseId,
          approvalStatus: "pending",
        });

        if (alreadyEnrolled || alreadyApplied) {
          unavailableStudents.push({
            ...entry,
            studentId: student._id,
            reason:
              "Student has already enrolled/applied in this course",
          });
          continue;
        }

        pendingEnrollmentStudents.push(student);
        continue;
      }

      let valid = true;
      for (const field of REQUIRED_FIELDS) {
        if (!entry[field] && entry[field] !== 0) {
          unavailableStudents.push({
            ...entry,
            reason: `Missing field: ${field}`,
          });
          valid = false;
          break;
        }
      }
      if (!valid) continue;

      const dob = excelSerialToDate(entry.dateOfBirth);
      const dobISO = new Date(dob).toISOString();
      if (!/^\d{4}-\d{2}-\d{2}T/.test(dobISO)) {
        unavailableStudents.push({ ...entry, reason: "Invalid DOB format" });
        continue;
      }

      if (entry.phoneNumber?.toString().length < 10) {
        unavailableStudents.push({
          ...entry,
          reason: "Phone number must be at least 10 digits",
        });
        continue;
      }

      if (isNaN(Number(entry.age))) {
        unavailableStudents.push({ ...entry, reason: "Age must be a number" });
        continue;
      }

      const gender = String(entry.gender || "").toLowerCase();
      if (!["male", "female", "others"].includes(gender)) {
        unavailableStudents.push({
          ...entry,
          reason: "Gender must be male, female, or others",
        });
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(entry.email)) {
        unavailableStudents.push({ ...entry, reason: "Invalid email format" });
        continue;
      }

      newStudents.push({ ...entry, dateOfBirth: dobISO });
    }

    return res.status(200).json({
      newStudents,
      pendingEnrollmentStudents,
      unavailableStudents,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to process student enrollment data.",
      success: false,
    });
  }
};


export const bulkEnrollStudents = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const date = new Date();
  const today = getDateOnlyFromDate(date);

  try {
    const { newStudents, pendingEnrollmentStudents, course } = req.body;
    const studyCenterId = req.user.studycenterId;
    const approvalEntries = [];

    const batch = await Batch.findOne({ _id: course.batchId }).session(session);
    if (!batch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    for (const student of pendingEnrollmentStudents) {
      approvalEntries.push({
        studentId: student._id,
        courseId: course.courseId,
        batchId: course.batchId,
        studycenterId: studyCenterId,
        year: batch.admissionYear,
        enrolledDate: today,
        approvalStatus: "pending",
      });
    }

    for (const student of newStudents) {
      const namePart = (student.name || "").substring(0, 3).toUpperCase();
      const phonePart = student.phoneNumber?.toString().slice(-3) || "000";
      const pinPart = student.pincode?.toString().slice(-3) || "000";
      const customStudentId = `${namePart}/${phonePart}/${pinPart}`;


      const newStudent = await Student.create(
        [
          {
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
            dateOfAdmission: today,
            parentName: student.parentName,
            qualification: student.qualification,
            sslc: student.sslc,
            profileImage: student.profileImage || "",
            studentId: customStudentId,
          },
        ],
        { session }
      );

      approvalEntries.push({
        studentId: newStudent[0]._id,
        courseId: course.courseId,
        batchId: course.batchId,
        studycenterId: studyCenterId,
        year: batch.admissionYear,
        enrolledDate: today,
        approvalStatus: "pending",
      });
    }

    await ApprovalWaiting.insertMany(approvalEntries, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "All students moved to approval waiting list.",
      count: approvalEntries.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Bulk ApprovalWaiting Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


