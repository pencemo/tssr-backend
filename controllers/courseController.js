import Course from "../models/courseSchema.js";

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("subjects", "name code");
    res.status(200).json({
      success: true,
      message: "Fetched all courses",
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
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
    const { courseName, manualId, category, batch, duration, subjects } = req.body;
    
    // Check if course with same manualId already exists
    const existingCourse = await Course.findOne({ manualId });
    if (existingCourse) {
      return res.status(400).json({ message: "Course with this manual ID already exists" });
    }

    const course = new Course({
      courseName,
      manualId,
      category,
      batch,
      duration,
      subjects
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
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update fields
    course.courseName = req.body.courseName || course.courseName;
    course.manualId = req.body.manualId || course.manualId;
    course.category = req.body.category || course.category;
    course.batch = req.body.batch || course.batch;
    course.duration = req.body.duration || course.duration;
    course.subjects = req.body.subjects || course.subjects;
    course.isActive = req.body.isActive !== undefined ? req.body.isActive : course.isActive;

    const updatedCourse = await course.save();
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
}; 