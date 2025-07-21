import mongoose from "mongoose";
import StudyCenter from "../models/studyCenterSchema.js"; 
import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import Batch from "../models/batchSchema.js";
import Course from "../models/courseSchema.js";

export const addStudyCenter = async (req, res) => {
  try {
    const {
      name,
      renewalDate,
      place,
      pincode,
      district,
      state,
      centerHead,
      email,
      authEmail,
      phoneNumber,
      courses,
      password,
    } = req.body;

    // === Email format validation ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // === Check if email already exists ===
    const emailExistsInUser = await User.findOne({ authEmail });

    if (emailExistsInUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in the system",
      });
    }

    // === Validate required fields ===
    const requiredFields = {
      name,
      renewalDate,
      place,
      pincode,
      district,
      state,
      centerHead,
      email,
      authEmail,
      // phoneNumber,
      password,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${key}`,
        });
      }
    }

    // === Generate regNo and atcId format: ABC/XYZ/1050 (starts from 1050) ===
    let newNumber = 1051;
    let regNo = 50301;
    const lastCenter = await StudyCenter.findOne().sort({ createdAt: -1 });

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

    const namePart = name.slice(0, 3).toUpperCase();
    const districtPart = district.slice(0, 3).toUpperCase();
    const atcId = `${namePart}/${districtPart}/${newNumber}`;

    // === Create StudyCenter ===
    const newStudyCenter = new StudyCenter({
      name,
      renewalDate: new Date(renewalDate),
      place,
      pincode,
      district,
      state,
      centerHead,
      atcId,
      regNo: regNo,
      email,
      phoneNumber,
      courses,
      isApproved: true,
      isActive: true,
    });

    const savedCenter = await newStudyCenter.save();

    // === Create related User ===
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: centerHead,
      email: authEmail,
      password: hashedPassword,
      role: "studycenter_user",
      phoneNumber,
      studycenterId: savedCenter._id,
      isAdmin: false,
      isVerified: true,
      isActive: true,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Study center and user created successfully.",
      data: savedCenter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

export const getVerifiedActiveStudyCenters = async (req, res) => {
  try {
    const currentDate = new Date();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || "";

    // Build the search condition
    const searchCondition = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
            { atcId: { $regex: searchQuery, $options: "i" } },
           
          ],
        }
      : {};

    // Final query condition
    const queryCondition = {
      isApproved: true,
      renewalDate: { $gt: currentDate },
      ...searchCondition,
    }; 

    const studyCenters = await StudyCenter.find(queryCondition)
      .populate("courses")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudyCenter.countDocuments(queryCondition);

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
  const { id } = req.query;

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

    const user = await User.find({ studycenterId: studyCenter._id }).select(
      "-password -__v -updatedAt -createdAt -role -isAdmin -isVerified -verificationCode"
    );
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user found for this study center.",
      });
    }

    return res.status(200).json({
      success: true,
      data: studyCenter,
      user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};


export const updateStudyCenter = async (req, res) => {
  try {
    const { id } = req.query;
    const {
      name,
      renewalDate,
      place,
      pincode,
      district,
      state,
      centerHead,
      email,
      phoneNumber,
      courses,
      isActive,
      isApproved,
      users = [],
    } = req.body;


    console.log("Users to update:",req.body);

    // === Email format check (only if email is being updated) ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (renewalDate !== undefined)
      updateFields.renewalDate = new Date(renewalDate);
    if (place !== undefined) updateFields.place = place;
    if (pincode !== undefined) updateFields.pincode = pincode;
    if (district !== undefined) updateFields.district = district;
    if (state !== undefined) updateFields.state = state;
    if (centerHead !== undefined) updateFields.centerHead = centerHead;
    if (email !== undefined) updateFields.email = email;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (courses !== undefined) updateFields.courses = courses;
    if (isApproved !== undefined) updateFields.isApproved = isApproved;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedCenter = await StudyCenter.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found",
      });
    }

    // === Process each user update/create ===
    for (const user of users) {
      const { _id, name, email, phoneNumber, password, isActive } = user;

      const updateUserFields = {};
      if (name !== undefined) updateUserFields.name = name;
      if (email !== undefined) updateUserFields.email = email;
      if (phoneNumber !== undefined) updateUserFields.phoneNumber = phoneNumber;
      if (isActive !== undefined) updateUserFields.isActive = isActive;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateUserFields.password = hashedPassword;
      }

      if (email) {

        const emailExistsInUser = await User.findOne({
          email,
          ...(_id ? { _id: { $ne: _id } } : {}),
        });

        if (emailExistsInUser) {
          return res.status(400).json({
            success: false,
            message: `Email ${email} is already in use, Try another email`,
          });
        }

      }
      if (_id) {
        await User.findByIdAndUpdate(_id, updateUserFields, {
          new: true,
          runValidators: true,
        });
      } else {
        if (!password) continue; 



        await User.create({
          ...updateUserFields,
          password: updateUserFields.password,
          isVerified: true,
          role: "studycenter_user",
          isAdmin: false,
          studycenterId: id,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Study center and users updated successfully",
      data: updatedCenter,
    });
  } catch (err) {
    console.error("Update study center error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};


export const getAllStudyCenterForExcel = async (req, res) => {
  try {
    const studyCenters = await StudyCenter.find()
      .sort({ createdAt: -1 })
      .select("-__v  -updatedAt")
      .populate("courses", "name -_id"); // this will replace _id with { _id, courseName }

    return res.status(200).json({
      success: true,
      message: `${studyCenters.length} study center(s) ready for Excel export`,
      data: studyCenters,
    });
  } catch (error) {
    console.error("Error fetching study centers for Excel:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study centers for Excel",
      data: [],
    });
  }
};

export const getCoursesWithBatchesOfAStudyCenter = async (req, res) => {
  const user = req.user;
  const studycenterId = user.studycenterId;
  let results = [];
  try {
    if (user.isAdmin) {
      const courses =await Course.find();
      results = await Promise.all(
        courses.map(async (course) => {
          const batches = await Batch.find({ courseId: course._id }).select(
            "_id month"
          ); // only fetch id and month

          return {
            courseId: course._id,
            courseName: course.name,
            batches,
          };
        })
      );

    } else {
      const { id } = req.query


      // Get the studycenter with its courses
      const studycenter = await StudyCenter.findById(studycenterId).populate(
        "courses"
      );

      if (!studycenter) {
        return res
          .status(404)
          .json({ success: false, message: "Studycenter not found" });
      }

       results = await Promise.all(
        studycenter.courses.map(async (course) => {
          const batches = await Batch.find({ courseId: course._id }).select(
            "_id month"
          ); // only fetch id and month

          return {
            courseId: course._id,
            courseName: course.name,
            batches,
          };
        })
      );
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching courses and batches:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const editStudycenterFieldsByStudycenter = async (req, res) => {
  try {
    const id  = req.user.studycenterId;
    
    const {
      name,
      email,
      phoneNumber,
      pincode,
      district,
      place,
      centerHead,
    } = req.body;

    const updatedCenter = await StudyCenter.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phoneNumber,
        pincode,
        district,
        place,
        centerHead,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCenter) {
      return res.status(404).json({ message: 'Study Center not found' , success:false });
    }

    res.json({ message: 'Study Center updated successfully', data: updatedCenter , success:true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' , success:false});
  }
};










