import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    codeExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    studycenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studycenter",
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


const User = mongoose.model("User", userSchema);

export default User;
