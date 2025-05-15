import express from "express";
// Controller functions (to be implemented in a separate controller file)
import { createBatch, editAdmissionStatus, getAdmissionNotAvailableBatches, getAdmissionOpenedBatches, getAdmissionScheduledBatches, getBatchesOfCourse, getOpenOrManuallyStartedBatches, ToggleAdmissionStatusToClose, updateBatchDates } from "../controllers/batchController.js";
const router = express.Router();

router.post("/createBatch", createBatch);
router.get("/getBatchesOfCourse", getBatchesOfCourse);
router.post("/editAdmissionStatus", editAdmissionStatus);
router.post("/editBatchDate", updateBatchDates);
router.get("/getOpenOrManuallyStartedBatches", getOpenOrManuallyStartedBatches);
router.get("/admissionOpened", getAdmissionOpenedBatches);
router.get("/admissionScheduled", getAdmissionScheduledBatches);
router.get("/admissionNotOpen", getAdmissionNotAvailableBatches);
router.post("/toggleBatchStatus", ToggleAdmissionStatusToClose);
export default router;

