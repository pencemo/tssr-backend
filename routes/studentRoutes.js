import express from "express";
import {  getAllStudentsDownloadForAdmin, getOneStudent, getStudentsForDl, getStudyCenterStudents } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { reportDownloadAccess } from "../middlewares/reportsDownloadMiddleware.js";
const router = express.Router();


router.get("/getAllStudents", isAuthenticated, getStudyCenterStudents);
router.get("/getOneStudent", isAuthenticated, getOneStudent);
router.post("/getStudentsForDl", isAuthenticated, reportDownloadAccess, getStudentsForDl);
router.post("/getAllStudentForAdmin", getAllStudentsDownloadForAdmin);

export default router;

