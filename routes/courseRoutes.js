import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourseById,
  getBatchesByStudyCenterOfAdmOpen,
} from "../controllers/courseController.js";
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { getAdmissionOpenBatchesByStudyCenter } from "../controllers/batchController.js";

const router = express.Router();

// Course Routes
router.get("/getAllCourses",isAuthenticated ,getAllCourses);

router.get("/getcoursebyid/:id", getCourseById);
router.post("/create", createCourse);
router.put("/update", updateCourseById);
router.get(
  "/getAllOpenedCourseAndBatchOfStudycenter",
  isAuthenticated,
  getBatchesByStudyCenterOfAdmOpen
);

export default router; 