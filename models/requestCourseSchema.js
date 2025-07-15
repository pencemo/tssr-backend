// models/Result.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const requestCourseSchema = new Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studycenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studycenter",
      required: true,
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);



const Result = mongoose.model("RequestCourse", requestCourseSchema);

export default Result;



