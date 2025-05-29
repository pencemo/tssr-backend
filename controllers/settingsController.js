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