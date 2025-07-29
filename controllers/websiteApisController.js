import StudyCenter from "../models/studyCenterSchema.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";

export const requestATC = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      place,
      pincode,
      district,
      state,
      centerHead,
      courses,
    } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !place ||
      !pincode ||
      !district ||
      !state ||
      !centerHead
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including at least one course.",
      });
    }

    const existingCenter = await StudyCenter.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingCenter || existingUser) {
      return res.status(409).json({
        success: false,
        message: "A study center with this email already exists.",
      });
    }

    const newStudyCenter = new StudyCenter({
      name,
      email,
      phoneNumber,
      place,
      pincode,
      district,
      state,
      centerHead,
      courses,
      isApproved: false,
      isActive: false,
    });

    await newStudyCenter.save();

    return res.status(201).json({
      success: true,
      message: "Study center request submitted successfully.",
      studyCenterId: newStudyCenter._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting the study center request.",
      error: error.message,
    });
  }
};

export const getUnapprovedStudyCenters = async (req, res) => {
  try {
    const unapprovedCenters = await StudyCenter.find({
      isApproved: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: unapprovedCenters.length,
      data: unapprovedCenters,
    });
  } catch (error) {
    console.error("Error fetching unapproved study centers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching unapproved study centers.",
      error: error.message,
    });
  }
};

export const updateAtcRequest = async (req, res) => {
  try {
        console.log("query:", req.body);

    const { status, date, id } = req.body;

    console.log("Update ATC Request:", req.body);

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'.",
      });
    }

    const studyCenter = await StudyCenter.findById(id);
    if (!studyCenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found.",
      });
    }


    if (status === "accepted") {
      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Renewal date is required when accepting the request.",
        });
      }

      let newNumber = 1050;
      let regNo = 50301;
      const lastCenter = await StudyCenter.findOne({ isApproved: true }).sort({
        createdAt: -1,
      });
      console.log("Last Center:", lastCenter);

      if (lastCenter?.atcId) {
        const parts = lastCenter.atcId.split("/");
        const lastNum = parseInt(parts[2]);
        if (!isNaN(lastNum)) {
          newNumber = lastNum + 1;
        }
      }

      if (lastCenter?.regNo) {
        const lastRegNo = parseInt(lastCenter.regNo);
        if (!isNaN(lastRegNo)) {
          regNo = lastRegNo + 1;
        }
      }

      const namePart = (studyCenter.name || "XXX").slice(0, 3).toUpperCase();
      const districtPart = (studyCenter.district || "XXX").slice(0, 3).toUpperCase();
      const newAtcId = `${namePart}/${districtPart}/${newNumber}`;

      studyCenter.isApproved = true;
      studyCenter.isActive = true;
      studyCenter.renewalDate = new Date(date);
      studyCenter.atcId = newAtcId;
      studyCenter.regNo = regNo;

      await studyCenter.save();

      // Create a user for the study center
      const phone = studyCenter.phoneNumber?.toString() || "";
      const last6Digits = phone.slice(-6);
      console.log("Last 6 digits of phone:", last6Digits);
      const hashedPassword = await bcrypt.hash(last6Digits, 10);

      const user = await User.create({
        name: studyCenter.centerHead,
        email: studyCenter.email,
        password: hashedPassword,
        isAdmin: false,
        isVerified: true,
        role: "studycenter_user",
        studycenterId: studyCenter._id,
        phoneNumber: studyCenter.phoneNumber,
        isActive: true,
      });

      return res.status(200).json({
        success: true,
        message: "Study center approved and user account created successfully.",
        data: {
          studyCenter,
          user,
        },
      });
    } else if (status === "rejected") {
      await StudyCenter.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Study center request rejected and deleted successfully.",
      });
    }
  } catch (error) {
    console.error("Error updating ATC request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the ATC request.",
      error: error.message,
    });
  }
};
