import bcrypt from "bcryptjs";
import Batch from "../models/batchSchema.js";
import Course from "../models/courseSchema.js";
import Enrollment from "../models/enrollmentSchema.js";
import Settings from "../models/settingsSchema.js";
import Student from "../models/studentSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";
import Subject from "../models/subjectSchema.js";
import User from "../models/userSchema.js";


export const reportDownload = async(req, res) => {
  try {
    const students = await Student.find();
    const batches = await Batch.find();
    const courses = await Course.find();
    const enrollment = await Enrollment.find();
    const settings = await Settings.find();
    const studycenter = await StudyCenter.find();
    const subject = await Subject.find();
    const users = await User.find();

    return res.json({
      message: "report downloaded successfully .",
      success: true,
      students,
      batches,
      courses,
      enrollment,
      settings,
      studycenter,
      subject,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error downloading report",
      success: false,
      error: error.message
    })
  }

}

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if(!settings){
      return res.status(404).json({
        message: "No settings found",
        success:false
      })
    } 
    return res.status(200).json({
      message: "Settings found",
      success: true,
      data: settings
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error getting settings",
      success: false,
      error: error.message
    })
  }
}


export const toggleSettingsField = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Missing 'key' in query parameters",
      });
    }

    // Get settings document (assuming one settings document exists)
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings document not found",
      });
    }
    // Toggle the value
    settings[key] = !settings[key];
    await settings.save();

    return res.json({
      success: true,
      message: `Settings updated successfully`,
      data: { [key]: settings[key] },
    });
  } catch (error) {
    console.error("Error updating setting field:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating setting field",
    });
  }
};

export const updateAdminAndUserFields = async (req, res) => {
  try {
    const { name, phoneNumber, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false
      })
    }
    if (newPassword) {
        if(!oldPassword){
            return res.status(400).json({
                message: "Old password is required to change password",
                success: false
            })
      }
      const isMatch =await bcrypt.compare(oldPassword, user.password);
      console.log(isMatch);
      if (!isMatch) {
        return res.status(400).json({
          message: "Old password is incorrect",
          success: false
        })
      }
      const hashedPassword =await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    if (name) {
      user.name = name;
    }
    if(phoneNumber){
      user.phoneNumber = phoneNumber;
    }
    await user.save()
    return res.status(200).json({
      message: "Profile updated .",
      success: true,
      data: user
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error updating admin fields",
      success: false,
      error: error.message
    })
  }
}