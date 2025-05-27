// models/Student.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/.+\@.+\..+/, "Please provide a valid email address"],
    },
    adhaarNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studyCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studycenter",
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    dateOfAdmission: {
      type: Date,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    sslc: {
      type: String,
      required: true,
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
