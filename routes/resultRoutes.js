import express from "express";
import { deleteResults, fetchAllResults, storeResultFromExcel } from "../controllers/resultController.js";
const router = express.Router();

router.post("/storeResultFromExcel", storeResultFromExcel);
router.get("/getAllResults", fetchAllResults);
router.post("/deleteResult",deleteResults);

export default router;
