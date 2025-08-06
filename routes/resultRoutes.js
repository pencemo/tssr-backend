import express from "express";
import { storeResultFromExcel } from "../controllers/resultController.js";
const router = express.Router();

router.post("/storeResultFromExcel", storeResultFromExcel);

export default router;
