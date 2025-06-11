import express from "express";
import {  getScheduledExamBatches, scheduleExam } from "../controllers/ExamController.js";


const router = express.Router();

router.post("/scheduleExam",scheduleExam);
router.get("/getScheduledExamBatches",getScheduledExamBatches);

export default router;

