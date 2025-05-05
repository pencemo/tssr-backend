import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

// Course Routes
router.get("/getallcourses", getAllCourses);
router.get("/getcoursebyid/:id", getCourseById);
router.post("/create", createCourse);
router.put("/update/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);

export default router; 