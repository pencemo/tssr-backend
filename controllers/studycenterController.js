import mongoose from "mongoose";
import StudyCenter from "../models/studyCenterSchema.js"; // adjust the path if needed

export const addStudyCenter = async (req, res) => {
  try {
    const {
      name,
      renewalDate,
      website,
      place,
      pincode,
      city,
      state,
      centerHead,
      atcId,
      email,
      phoneNumber,
      //   courses,
      regNo,
      isApproved,
      isActive,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      renewalDate,
      place,
      pincode,
      city,
      state,
      centerHead,
      atcId,
      email,
      phoneNumber,
      //   courses,
      regNo,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${key}`,
        });
      }
    }

    const newStudyCenter = new StudyCenter({
      name,
      renewalDate: new Date(renewalDate),
      website,
      place,
      pincode,
      city,
      state,
      centerHead,
      atcId,
      email,
      phoneNumber,
      //   courses,
      regNo,
      isApproved: isApproved !== undefined ? isApproved : true,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newStudyCenter.save();

    res.status(201).json({
      success: true,
      message: "Study center added successfully.",
      data: newStudyCenter,
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.regNo) {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

export const getVerifiedActiveStudyCenters = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Get page and limit from query params, default to page=1 and limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query with filters and pagination
    const studyCenters = await StudyCenter.find({
      isApproved: true,
      renewalDate: { $gt: currentDate },
    })
      .populate("courses")
      .skip(skip)
      .limit(limit);

    // Total count (for frontend pagination UI)
    const total = await StudyCenter.countDocuments({
      isApproved: true,
      renewalDate: { $gt: currentDate },
    });

    res.status(200).json({
      success: true,
      message:
        "Verified, active, and non-expired study centers fetched successfully.",
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: studyCenters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

export const getStudyCenterById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Study Center ID",
    });
  }

  try {
    const studyCenter = await StudyCenter.findById(id);

    if (!studyCenter) {
      return res.status(404).json({
        success: false,
        message: "Study Center not found",
      });
    }

    res.status(200).json({
      success: true,
      data: studyCenter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};






