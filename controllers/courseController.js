import Course from "../models/courseSchema.js";

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("subjects", "name code");
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving courses", error });
  }
};

// Get single course by id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("subjects", "name code");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving course", error });
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
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: "Error creating course", error });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
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
    res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(400).json({ message: "Error updating course", error });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting course", error });
  }
}; 