import Student from "../models/studentSchema.js";
import Enrollment from "../models/enrollmentSchema.js";
import { getDateOnlyFromDate } from "../utils/dateUtils.js";
import StudyCenter from "../models/studyCenterSchema.js";
import { getLast4Digits } from "../utils/last4Digit.js";
import Batch from "../models/batchSchema.js";
export const checkEnrollmentByAdhar = async (req, res) => {
  try {
    const { adhaarNumber } = req.body;

    const adharNumber = adhaarNumber?.adhaarNumber || adhaarNumber; // handle if directly passed
   // console.log("Received Aadhaar number:", adharNumber);

    if (!adharNumber) {
      return res.status(400).json({
        data: {
          studentExists: false,
          enrolled: false,
          student: null,
          message: "Aadhaar number is required",
        },
        success:false
      });
    }

    // 1. Find the student by Aadhaar number
    const student = await Student.findOne({ adhaarNumber: adharNumber });
    //console.log("Found student:", student);

    if (!student) {
      // Phase 1: Student not found
      return res.status(200).json({
        data: {
          studentExists: false,
          enrolled: false,
          student: null,
          message: "Student with this Aadhaar number does not exist.",
        },
        success:true
      });
    }

    // 2. Check for active (isComplete: false) enrollments
    const enrollments = await Enrollment.find({
      studentId: student._id,
      isComplete: false,
    });
    console.log("enrollment :",enrollments);
    if (enrollments.length > 0) {
      return res.status(200).json({
        data: {
          studentExists: true,
          enrolled: true,
          student,
          message: "Student is already enrolled in an active course.",
        },
        success:true
      });
    } else {
      return res.status(200).json({
        data: {
          studentExists: true,
          enrolled: false,
          student,
          message: "Proceed with new Enrollment .",
        },
        success:true
      });
    }
    
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return res.status(500).json({
      data: {
        studentExists: false,
        enrolled: false,
        student: null,
        message: "Internal server error",
      },
      success:false
    });
  }
};


export const createStudent = async (req, res) => {
  try {
    const studyCenterId = req.user.studycenterId; // From authentication middleware
    const data = req.body;
    const {
      name,
      age,
      dateOfBirth,
      gender,
      phoneNumber,
      state,
      district,
      place,
      pincode,
      email,
      adhaarNumber,
      dateOfAdmission,
      parentName,
      qualification,
    } = data;

    const profileImageFile = req.files?.find((file) => file.fieldname === "profileImage");
    const sslcFile = req.files?.find((file) => file.fieldname === "sslc");

    const profileImage = profileImageFile?.path || "";
    const sslc = sslcFile?.path || "";
    

    const newStudent = new Student({
      name,
      age,
      dateOfBirth,
      gender,
      phoneNumber,
      place,
      state,
      district,
      pincode,
      email,
      adhaarNumber,
      studyCenterId,
      dateOfAdmission,
      parentName,
      registrationNumber: "123456",
      qualification,
      sslc,
      profileImage,
    });
    
    console.log("New student object:", newStudent);
    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
      success: true,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(400).json({
      message: "Failed to create student",
      error: error.message,
      success: false,
    });
  }
};

export const createEnrollment = async (req, res) => {
  try {
    const {data} = req.body;
    const { studentId, courseId, batchId, year } = data;
    const studycenterId = req.user.studycenterId;

    if (!studentId || !courseId || !batchId || !year) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" , success: false});
    }

    // Prevent duplicate enrollments
    const existing = await Enrollment.findOne({
      studentId,
      courseId,
      batchId,
      year,
    });

    if (existing) {
      return res.status(409).json({
        message:
          "Student is already enrolled in this course and batch for the given year",
        success: false,
      });
    }

    // Manually set default status fields from the backend
    const newEnrollment = new Enrollment({
      studentId,
      courseId,
      batchId,
      year,
      studycenterId,
      enrolledDate: new Date(), // explicitly set current date
      isCompleted: false,
      isPassed: false,
      isCertificateIssued: false,
    });

    await newEnrollment.save();

    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment: newEnrollment,
      success: true,
    });
  } catch (error) {
    console.error("Enrollment creation error:", error);
    res.status(500).json({ message: "Internal Server Error" , success: false});
  }
};

export const createStudentWithEnrollment = async (req, res) => {
  try {
    const studyCenterId = req.user.studycenterId;
    const studentData = req.body.student;
    console.log("req.body:", req.body); 
    const enrollmentData = req.body.enrollmentData;

    const {
      name,
      age,
      dateOfBirth,
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

    const { courseId, batchId } = enrollmentData;

    if (!adhaarNumber || !courseId || !batchId ) {
      return res.status(400).json({
        message: "Aadhaar number, courseId, batchId, and year are required.",
        success: false,
      });
    }

    let student = await Student.findOne({ adhaarNumber });

    if (!student) {
      const studyCenter = await StudyCenter.findOne({ _id: studyCenterId });
      const atcId = studyCenter.atcId;
      const lastFour = atcId.toString().slice(-4);

      const lastStudent = await Student.findOne({ studyCenterId })
        .sort({ createdAt: -1 })
        .limit(1);

      let lastRegNo;

      if (!lastStudent) {
        lastRegNo = 1000;
      } else {
        const regMatch = lastStudent.registrationNumber?.match(/\d{4}$/);
        lastRegNo = regMatch ? parseInt(regMatch[0], 10) + 1 : 1001;
      }

      const paddedReg = String(lastRegNo).padStart(4, "0");
      const registrationNumber = `${lastFour}${paddedReg}`;

      const namePart = (name || "").substring(0, 3).toUpperCase();
      const phonePart = phoneNumber?.toString().slice(-3) || "000";
      const pinPart = pincode?.toString().slice(-3) || "000";
      const customStudentId = `${namePart}/${phonePart}/${pinPart}`;

      const newStudent = new Student({
        name,
        age,
        dateOfBirth,
        gender,
        phoneNumber,
        place,
        state,
        district,
        pincode,
        email,
        adhaarNumber,
        studyCenterId,
        dateOfAdmission,
        parentName,
        qualification,
        registrationNumber,
        studentId: customStudentId,
        sslc, // from URL
        profileImage, // from URL
      });

      student = await newStudent.save();
    }
    const batch = await Batch.findOne({_id: batchId});
    console.log("batch:", batch);
    const newEnrollment = new Enrollment({
      studentId: student._id,
      courseId,
      batchId,
      year:batch?.admissionYear,
      studycenterId: studyCenterId,
      enrolledDate: new Date(),
      isCompleted: false,
      isPassed: false,
      isCertificateIssued: false,
    });

    await newEnrollment.save();

    return res.status(201).json({
      message: "Student and enrollment created successfully.",
      student,
      enrollment: newEnrollment,
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

// excel Uploading for enrollment
export const EnrollExcelStudents = async (req, res) => {
  try {
    const data = req.body;
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
      "year"
    ];

    const newStudents = [];
    const pendingEnrollmentStudents = [];
    const unavailableStudents = [];

    for (const entry of data) {
      const adhaar = entry.adhaarNumber?.toString().trim();

      if (!adhaar) {
        unavailableStudents.push({
          ...entry,
          reason: "Missing Aadhaar number",
        });
        continue;
      }

      const existingStudent = await Student.findOne({ adhaarNumber: adhaar });

      if (existingStudent) {
        const isEnrolled = await Enrollment.findOne({
          studentId: existingStudent._id,
          isCompleted: false,
        });

        if (isEnrolled) {
          unavailableStudents.push({
            ...entry,
            studentId: existingStudent._id,
            reason: "Already enrolled",
          });
        } else {
          // Use existing student data from DB, no required field check
          pendingEnrollmentStudents.push(existingStudent);
        }
      } else {
        // For new student only, check required fields
        const missingFields = REQUIRED_FIELDS.filter(
          (field) => !entry[field] && entry[field] !== 0
        );

        if (missingFields.length > 0) {
          unavailableStudents.push({
            ...entry,
            reason: "Missing required fields",
            missingFields,
          });
        } else {
          newStudents.push(entry);
        }
      }
    }

    return res.status(200).json({
      newStudents,
      pendingEnrollmentStudents,
      unavailableStudents,
      success: true,
    });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({
      error: "Failed to process student enrollment data.",
      success: false,
    });
  }
};

//Enroll bulk students
export const bulkEnrollStudents = async (req, res) => {
  const date = new Date();
  const today = getDateOnlyFromDate(date);

  try {
    const { newStudents, pendingEnrollmentStudents, course } = req.body;
    const studyCenterId = req.user.studycenterId;
    const enrollments = [];

    const batch = await Batch.findOne({ _id: course.batchId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Enroll pending students
    for (const student of pendingEnrollmentStudents) {
      enrollments.push({
        studentId: student._id,
        courseId: course.courseId,
        batchId: course.batchId,
        studycenterId: studyCenterId,
        year: batch.admissionYear,
        isCompleted: false,
        isPassed: false,
        isCertificateIssued: false,
        enrolledDate: today,
      });
    }

    const studyCenter = await StudyCenter.findOne({ _id: studyCenterId });
    const atcId = studyCenter.atcId;
    const lastFour = atcId.toString().slice(-4); // Ensure last 4 digits

    // Get the last registered student for that study center
    const lastStudent = await Student.findOne({ studyCenterId })
      .sort({ createdAt: -1 }) // or _id: -1
      .limit(1);

    let lastRegNo;

    if (!lastStudent) {
      // No students yet, start from 1000
      lastRegNo = 1000;
    } else {
      const regMatch = lastStudent.registrationNumber?.match(/\d{4}$/); // Get last 4 digits
      lastRegNo = regMatch ? parseInt(regMatch[0], 10) + 1 : 1001;
    }

    for (const student of newStudents) {
      const paddedReg = String(lastRegNo).padStart(4, "0");
      const registrationNumber = `${lastFour}${paddedReg}`;

      // Generate custom student ID
      const namePart = (student.name || "").substring(0, 3).toUpperCase();
      const phonePart = student.phoneNumber?.toString().slice(-3) || "000";
      const pinPart = student.pincode?.toString().slice(-3) || "000";
      const customStudentId = `${namePart}/${phonePart}/${pinPart}`;

      const newStudent = await Student.create({
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
        studyCenterId: studyCenterId,
        registrationNumber,
        studentId: customStudentId,
        dateOfAdmission: today,
        parentName: student.parentName,
        qualification: student.qualification,
        sslc: student.sslc,
        profileImage: student.profileImage || "",
      });

      enrollments.push({
        studentId: newStudent._id,
        courseId: course.courseId,
        batchId: course.batchId,
        year: batch.admissionYear,
        studycenterId: studyCenterId,
        isCompleted: false,
        isPassed: false,
        isCertificateIssued: false,
        enrolledDate: today,
      });

      lastRegNo += 1;
    }

    await Enrollment.insertMany(enrollments);

    return res.status(200).json({
      success: true,
      message: "Students enrolled successfully.",
      count: enrollments.length,
    });
  } catch (error) {
    console.error("Bulk Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};







