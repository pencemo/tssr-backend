import express from "express";
import { addStudyCenter } from "../controllers/studycenterController.js";

const router = express.Router();


router.post("/addStudyCenter", addStudyCenter);

export default router;

