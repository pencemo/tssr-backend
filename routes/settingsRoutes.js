import express from "express";
import { getSettings, reportDownload } from "../controllers/settingsController.js";

const router = express.Router();
router.get("/reportDownload", reportDownload);
router.get("/getSettings", getSettings);

export default router;


