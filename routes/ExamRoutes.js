import express from "express";
import {  closeScheduledExamBatch, getScheduledExamBatches, scheduleExam } from "../controllers/ExamController.js";


const router = express.Router();

router.post("/scheduleExam", scheduleExam);
router.put("/closeScheduledExam", closeScheduledExamBatch);
router.get("/getScheduledExamBatches",getScheduledExamBatches);

export default router;

