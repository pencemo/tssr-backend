import express from "express";
import {  getOneStudent, getStudentsForDl, getStudyCenterStudents } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { reportDownloadAccess } from "../middlewares/reportsDownloadMiddleware.js";
const router = express.Router();


router.get("/getAllStudents", isAuthenticated, getStudyCenterStudents);
router.get("/getOneStudent", isAuthenticated, getOneStudent);
router.post("/getStudentsForDl", isAuthenticated, reportDownloadAccess, getStudentsForDl);


export default router;

