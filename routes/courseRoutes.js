import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourseById,
} from "../controllers/courseController.js";

const router = express.Router();

// Course Routes
router.get("/getAllCourses", getAllCourses);

router.get("/getcoursebyid/:id", getCourseById);
router.post("/create", createCourse);
router.put("/update", updateCourseById);

export default router; 