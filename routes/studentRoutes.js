import express from "express";
import { getAllStudents, getStudentById, updateStudent } from "../controllers/studentController.js";
const router = express.Router();


router.get('/getAllStudents', getAllStudents);
router.get('/getStudentById/:id', getStudentById);
router.put('/updateStudent/:id', updateStudent);
export default router;

