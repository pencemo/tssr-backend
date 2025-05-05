import Course from "../models/courseSchema.js";
import Student from "../models/studentSchema.js";
import Studycenter from "../models/studyCenterSchema.js";

export const getAllStudents = async (req, res) => {
    try {
      console.log("Fetching all students...");
 const centers = await Student.find().populate(
   //    "courseId studyCenterId",
   //    "courseName category name"
   "studyCenterId courseId",
   "name courseName"
 );
    res.status(200).json(centers);
  } catch (error) {
        res.status(400).json({ message: "Error retrieving students", error });
        console.log(error);
  }
};

// get single student by id
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "studyCenterId courseId",
      " name courseName"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving student", error });
  }
};


export const updateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
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

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating student", error: error.message });
  }
};
