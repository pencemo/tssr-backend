import express from "express";
import { getUnapprovedStudyCenters, requestATC, updateAtcRequest, verifiATC } from "../controllers/websiteApisController.js";

const router = express.Router();

router.post("/requestAtc", requestATC);
router.post("/verify-atc", verifiATC);
router.get("/getNotApprovedStudycenter", getUnapprovedStudyCenters);
router.post("/updateAtcRequest",updateAtcRequest);

export default router;

