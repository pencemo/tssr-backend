import mongoose from "mongoose";

const ExamScheduleSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    year: {
      type: String,
      required: true,
    },
    changedCenters: [
      {
        _id:false,
        centerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Center",
        }, 
        newLocation: {
          type: String,
        }, 
      },
    ],
    examDate: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      }
    },
    examTime: {
      from:{
        type: String,
        required: true,
      },
      to:{
        type: String,
        required: true,
      }
    }
  },
  { timestamps: true }
);

const ExamSchedule = mongoose.model("ExamSchedule", ExamScheduleSchema);

export default ExamSchedule;