import express from "express";
import { getSettings, reportDownload, toggleSettingsField, updateAdminAndUserFields } from "../controllers/settingsController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/reportDownload", reportDownload);
router.get("/getSettings", getSettings);
router.post("/toggleSettingsField", toggleSettingsField);
router.post("/updateAdminAndUserField", isAuthenticated,  updateAdminAndUserFields);

export default router;


