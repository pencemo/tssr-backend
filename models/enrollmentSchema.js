import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    studycenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studycenter",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    enrolledDate: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    isCertificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
