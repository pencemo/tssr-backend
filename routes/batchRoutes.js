import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
// Controller functions (to be implemented in a separate controller file)
import { createBatch, editAdmissionStatus, getAdmissionNotAvailableBatches, getAdmissionOpenBatchesByStudyCenter, getAdmissionOpenedBatches, getAdmissionOpenedBatchesOfaCourse, getAdmissionScheduledBatches, getBatchesOfCourse, getOpenOrManuallyStartedBatches, ToggleAdmissionStatusToClose, updateBatchDates } from "../controllers/batchController.js";
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
//
router.get(
  "/admissionOpenedBatchesOfCourse",getAdmissionOpenedBatchesOfaCourse
);
// Get all batches for a specific study center
router.get(
  "/getAdmissionOpenBatchesByStudyCenter", isAuthenticated, getAdmissionOpenBatchesByStudyCenter
);
export default router;

