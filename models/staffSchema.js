import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    address: {
      place: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    gender: { type: String },
    staffId: { type: String },
    department: { type: String },
    qualification: { type: String },
    profileImage: { type: String },
    age: { type: Number },
    designation: { type: String },
    dob: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
