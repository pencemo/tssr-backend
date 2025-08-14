import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studyCenterName: {
      type: String,
      required: true,
    },
    examCenterName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    dateOfExam: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      default: "",
    },
    remark: {
      type: String,
      default: "",
    },
    subjects: [
      new mongoose.Schema(
        {
          name: { type: String },
          grade: { type: String },
        },
        { _id: false }
      ),
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Result", resultSchema);
