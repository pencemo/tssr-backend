import express from "express";
import { getAllCoursesForReg, getUnapprovedStudyCenters, requestATC, updateAtcRequest, verifiATC } from "../controllers/websiteApisController.js";

const router = express.Router();

router.post("/requestAtc", requestATC);
router.post("/verify-atc", verifiATC);
router.post("/updateAtcRequest",updateAtcRequest);
router.get("/getNotApprovedStudycenter", getUnapprovedStudyCenters);
router.get("/getAllCourses", getAllCoursesForReg);

export default router;

