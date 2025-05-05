import express from "express";
import { getAllStudents, getStudentById, updateStudent } from "../controllers/studentController.js";
const router = express.Router();


router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
export default router;

