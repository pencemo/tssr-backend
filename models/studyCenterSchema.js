import mongoose from "mongoose";

const { Schema } = mongoose;

const StudycenterSchema = new Schema(
  {
    logo: {
    type: String,      
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    renewalDate: {
      type: Date,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    pincode: {
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
    centerHead: {
      type: String,
      required: true,
    },
    atcId: {
      type: String,
    },
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    ],
    regNo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
  }
);

// StudycenterSchema.index({ courses: 1 });

const StudyCenter = mongoose.model("Studycenter", StudycenterSchema);

export default StudyCenter;
