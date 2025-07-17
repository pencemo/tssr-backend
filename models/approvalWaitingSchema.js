// models/Result.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const approvalWaitingSchema = new Schema({
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
  approvalStatus: {
    type: String,
    required: true,
  },
});


const Result = mongoose.model("ApprovalWaiting", approvalWaitingSchema);

export default Result;



