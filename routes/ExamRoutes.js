import express from "express";
import {  closeScheduledExamBatch, deleteExamSchedule, getAllExamSchedules, getScheduledExamBatches, getScheduledExamBatchesOfStudyCenter, scheduleExam } from "../controllers/ExamController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { passwordMiddleware } from "../middlewares/passwordMiddleware.js";

const router = express.Router();

router.post("/scheduleExam", scheduleExam);
router.put("/closeScheduledExam",isAuthenticated,passwordMiddleware, closeScheduledExamBatch);
router.get("/getScheduledExamBatches",getScheduledExamBatches);
router.get("/getScheduledExamBatchesOfStudyCenter", isAuthenticated, getScheduledExamBatchesOfStudyCenter);
router.post("/deleteExamSchedule", isAuthenticated, passwordMiddleware, deleteExamSchedule);
router.get("/getAllExamSchedules", getAllExamSchedules);
export default router;

