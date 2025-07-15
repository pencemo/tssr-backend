import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    month: {
      type: String,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      required: true,
    },
    admissionYear: {
      type: Number,
    },
    startDate: {
      type: Date,
      
    },
    endDate: {
      type: Date,
      
    },
    isAdmissionStarted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

batchSchema.index({ month: 1 });
batchSchema.index({ courseId: 1 });
batchSchema.index({ admissionYear: 1 }); 




export default mongoose.model("Batch", batchSchema);
