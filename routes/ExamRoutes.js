import express from "express";
import {  closeScheduledExamBatch, getScheduledExamBatches, getScheduledExamBatchesOfStudyCenter, scheduleExam } from "../controllers/ExamController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/scheduleExam", scheduleExam);
router.put("/closeScheduledExam", closeScheduledExamBatch);
router.get("/getScheduledExamBatches",getScheduledExamBatches);
router.get("/getScheduledExamBatchesOfStudyCenter",isAuthenticated,getScheduledExamBatchesOfStudyCenter);
export default router;

