import express from "express";
import { getDashBoardDataForAdmin, getDashboardDataForStudycenter } from "../controllers/dashboardController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getDashboardData", getDashBoardDataForAdmin);
router.get("/getDashboardDataOfStudycenter",isAuthenticated,getDashboardDataForStudycenter);

export default router;

