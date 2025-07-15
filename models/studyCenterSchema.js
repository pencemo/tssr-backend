import mongoose from "mongoose";

const { Schema } = mongoose;

const StudycenterSchema = new Schema(
  {
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
      required: true,
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
      required: true,
    },
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    ],
    regNo: {
      type: String,
      required: true,
      unique: true,
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

StudycenterSchema.index({ courses: 1 });

const StudyCenter = mongoose.model("Studycenter", StudycenterSchema);

export default StudyCenter;
