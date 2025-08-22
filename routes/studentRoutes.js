import express from "express";
import {  getAllStudentsDownloadForAdmin, getOneStudent, getStudentsForDl, getStudentsForResultUploadExcel, getStudyCenterStudents, updateStudentById } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { reportDownloadAccess } from "../middlewares/reportsDownloadMiddleware.js";
const router = express.Router();


router.get("/getAllStudents", isAuthenticated, getStudyCenterStudents);
router.get("/getOneStudent", isAuthenticated, getOneStudent);
router.post("/getStudentsForDl", isAuthenticated, reportDownloadAccess, getStudentsForDl);
router.post("/getAllStudentForAdmin", getAllStudentsDownloadForAdmin);
router.post("/editStudentDetails", updateStudentById);
router.post(
  "/getStudentDetailsForResultUploadExcel",
  getStudentsForResultUploadExcel
);

export default router;




