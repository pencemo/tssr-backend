import express from "express";
import {  getOneStudent, getStudentsForDl, getStudyCenterStudents } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/getAllStudents", isAuthenticated, getStudyCenterStudents);
router.get("/getOneStudent", isAuthenticated, getOneStudent);
router.post("/getStudentsForDl", isAuthenticated, getStudentsForDl);

export default router;

