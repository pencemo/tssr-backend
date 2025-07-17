import express from "express";
import { getPendingAndRejectedStudents, updateStatusOfPendingApprovals } from "../controllers/pendingStudentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/getPendingAndRejectedStudents",isAuthenticated ,getPendingAndRejectedStudents);
router.post(
  "/updateStatusOfPendingApproval",
  updateStatusOfPendingApprovals
);
export default router;
