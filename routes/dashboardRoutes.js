import express from "express";
import { getRecentBatchesWithEnrollmentCount } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/getDashboardData", getRecentBatchesWithEnrollmentCount);

export default router;

