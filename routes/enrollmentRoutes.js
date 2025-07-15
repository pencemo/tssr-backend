import express from "express";
const router = express.Router();

// Controller functions (to be implemented in a separate controller file)
import { bulkEnrollStudents, checkEnrollmentByAdhar, createStudentWithEnrollment ,EnrollExcelStudents } from "../controllers/enrollmentControler.js";
import upload from "../middlewares/upload.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";


router.post("/checkEnrolledOrNot", checkEnrollmentByAdhar);
// router.post("/createStudent", isAuthenticated, upload.any(), createStudent);
router.post("/createStudentWithEnrollment",isAuthenticated,createStudentWithEnrollment);
router.post("/EnrollmentUsingExcel", isAuthenticated, EnrollExcelStudents);
router.post("/bulkEnrollStudents", isAuthenticated, bulkEnrollStudents);
export default router;
