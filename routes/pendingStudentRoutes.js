import express from "express";
import { getPendingAndRejectedStudents } from "../controllers/pendingStudentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/getPendingAndRejectedStudents",isAuthenticated ,getPendingAndRejectedStudents);
export default router;
