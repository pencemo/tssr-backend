import mongoose from "mongoose";

const HallTicketSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    ExamStartDate: {
      type: Date,
      required: true,
    },
    ExamEndDate: {
      type: Date,
      required: true,
    },
    examTime: {
      type: Date,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

export default mongoose.model("HallTicket", HallTicketSchema);
