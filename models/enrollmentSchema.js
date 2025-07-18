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
    admissionNumber: {
      type: String,
      unique: true,
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
    certificateId: {
      type: String,
    },
  },
  { timestamps: true }
);

// enrollmentSchema.index({ studycenterId: 1 });
// enrollmentSchema.index({ year: 1 });
// enrollmentSchema.index({ courseId: 1 });
// enrollmentSchema.index({ batchId: 1 });
// enrollmentSchema.index({ createdAt: 1 });
// enrollmentSchema.index({ studentId: 1 });
// enrollmentSchema.index({ studycenterId: 1, year: 1 });

export default mongoose.model("Enrollment", enrollmentSchema);


