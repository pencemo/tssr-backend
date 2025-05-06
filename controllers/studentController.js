import Course from "../models/courseSchema.js";
import Student from "../models/studentSchema.js";
import Studycenter from "../models/studyCenterSchema.js";

export const getAllStudents = async (req, res) => {
  try {
    const centers = await Student.find().populate(
      "studyCenterId courseId",
      "name courseName"
    );
    res.status(200).json({
      success: true,
      message: "Fetched all students",
      data: centers,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error retrieving students",
    });
  }
};

// get single student by id
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "studyCenterId courseId",
      "name courseName"
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched student",
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error retrieving student",
    });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Manual field-by-field update (with basic validation)
    student.name = req.body.name || student.name;
    student.age = req.body.age || student.age;
    student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
    student.gender = req.body.gender || student.gender;
    student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
    student.address = {
      place: req.body.address?.place || student.address.place,
      city: req.body.address?.city || student.address.city,
      state: req.body.address?.state || student.address.state,
      pincode: req.body.address?.pincode || student.address.pincode,
    };
    student.email = req.body.email || student.email;
    student.adhaarNumber = req.body.adhaarNumber || student.adhaarNumber;
    student.studyCenterId = req.body.studyCenterId || student.studyCenterId;
    student.courseId = req.body.courseId || student.courseId;
    student.registrationNumber =
      req.body.registrationNumber || student.registrationNumber;
    student.dateOfAdmission =
      req.body.dateOfAdmission || student.dateOfAdmission;
    student.batch = req.body.batch || student.batch;
    student.parentName = req.body.parentName || student.parentName;
    student.qualification = req.body.qualification || student.qualification;
    student.sslc = req.body.sslc || student.sslc;
    student.profileImage = req.body.profileImage || student.profileImage;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating student",
    });
  }
};
