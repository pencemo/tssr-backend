import Course from "../models/courseSchema.js";
import Batch from "../models/batchSchema.js";
import mongoose from "mongoose";
import StudyCenter from "../models/studyCenterSchema.js";
// Get all courses


export const getAllCourses = async (req, res) => {
  try {
    const isAdmin = req.user.isAdmin;
    const studyCenterId = req.user.studycenterId;

    let courses = [];

    if (isAdmin) {
      // Admin: fetch all active courses
      courses = await Course.find({ isActive: true }).sort({ name: 1 });
    } else {
      if (!studyCenterId) {
        return res.status(400).json({
          success: false,
          message: "Study center ID is required",
        });
      }

      const studyCenter =
        await StudyCenter.findById(studyCenterId).select("courses");

      if (
        !studyCenter ||
        !studyCenter.courses ||
        studyCenter.courses.length === 0
      ) {
        return res.status(200).json({
          success: true,
          message: "No courses assigned to this study center",
          data: [],
        });
      }

      // Fetch the actual course documents using IDs
      courses = await Course.find({
        _id: { $in: studyCenter.courses },
        isActive: true,
      }).sort({ name: 1 })
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// Get single course by id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("subjects", "name code");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched course",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const { name, category, duration, subjects } = req.body;

    // Optional: Check if course with the same name already exists (if needed)
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this name already exists",
      });
    }

    const course = new Course({
      name,
      category,
      duration,
      subjects,
      isActive: true,
    });
    
    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: savedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

export const updateCourseById = async (req, res) => {
  const { id } = req.query;
  const { name, duration, category, subjects, isActive } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        name,
        duration,
        category,
        subjects,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("editCourseById error:", error);
    return res.status(500).json({ error: "Internal server error" ,success: false});
  }
};

export const getBatchesByStudyCenterOfAdmOpen = async (req, res) => {
  const studyCenterId = req.user.studycenterId;
  const currentDate = new Date();

  try {
    // Step 1: Fetch the study center and its courses
    const studyCenter = await StudyCenter.findById(studyCenterId)
      .populate("courses", "_id name category duration")
      .lean();

    if (!studyCenter) {
      return res.status(404).json({ message: "Study center not found." });
    }

    const courseIds = studyCenter.courses.map((course) => course._id);

    // Step 2: Fetch open batches
    const openBatches = await Batch.find({
      courseId: { $in: courseIds },
      isAdmissionStarted: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .populate("courseId", "_id name category duration")
      .lean();
    
  
    const courseBatchMap = {};

    // Initialize each course with empty batches array
    studyCenter.courses.forEach((course) => {
      courseBatchMap[course._id.toString()] = {
        courseId: course._id,
        name: course.name,
        category: course.category,
        duration: course.duration,
        batches: [],
      };
    });

    // Assign batches with only id and month name
    openBatches.forEach((batch) => {
      const courseId = batch.courseId._id.toString();
      if (courseBatchMap[courseId]) {
        courseBatchMap[courseId].batches.push({
          _id: batch._id,
          month: batch.month,
        });
      }
    });

    // Convert map to array and filter only courses with open batches
    const coursesWithBatches = Object.values(courseBatchMap).filter(
      (entry) => entry.batches.length > 0
    );

    return res.status(200).json({
      success: true,
      studyCenter: {
        id: studyCenter._id,
        name: studyCenter.name,
      },
      totalCoursesWithOpenBatches: coursesWithBatches.length,
      courses: coursesWithBatches,
    });
  } catch (err) {
    console.error("Error fetching open batches:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
