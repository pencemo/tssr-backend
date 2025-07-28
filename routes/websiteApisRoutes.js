import express from "express";
import { getUnapprovedStudyCenters, requestATC, updateAtcRequest } from "../controllers/websiteApisController.js";

const router = express.Router();

router.post("/requestAtc", requestATC);
router.get("/getNotApprovedStudycenter", getUnapprovedStudyCenters);
router.post("/updateAtcRequest",updateAtcRequest);

export default router;

