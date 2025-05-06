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
    //   courses,
      regNo,
      isVerified,
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
    //   courses,
      regNo,
      isVerified: isVerified !== undefined ? isVerified : true,
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

    const studyCenters = await StudyCenter.find({
      isVerified: true,
      isActive: true,
      renewalDate: { $gt: currentDate },
    }).populate("courses");

    res.status(200).json({
      success: true,
      message:
        "Verified, active, and non-expired study centers fetched successfully.",
      data: studyCenters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};