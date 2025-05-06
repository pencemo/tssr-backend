import mongoose from "mongoose";

const { Schema } = mongoose;

const StudycenterSchema = new Schema(
  {
    name: {
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
    website: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    place: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
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
    }
  },
  {
    timestamps: true,
  }
);

const StudyCenter = mongoose.model("Studycenter", StudycenterSchema);

export default StudyCenter;
