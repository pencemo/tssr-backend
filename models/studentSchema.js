// models/Student.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
      min: 1,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other","male","female","other"],
    },
    phoneNumber: {
      type: String,
    },
    place: {
      type: String,

    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    email: {
      type: String,
      // match: [/.+\@.+\..+/, "Please provide a valid email address"],
    },
    adhaarNumber: {
      type: String,
      unique: true,
    },
    // studyCenterId: {  
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Studycenter",
    //   required: true,
    // },
    // registrationNumber: {
    //   type: String,
    //   unique: true,
    // },
    dateOfAdmission: {
      type: Date,
    },
    parentName: {
      type: String,
    },
    qualification: {
      type: String,
    },
    sslc: {
      type: String,
    },
    profileImage: {
      type: String,
      default: "",
    },
    studentId: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);


const Student = mongoose.model("Student", studentSchema);

export default Student;
