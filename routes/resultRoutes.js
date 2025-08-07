import express from "express";
import { deleteResults, fetchAllResults, fetchResult, storeResultFromExcel } from "../controllers/resultController.js";
import { passwordMiddleware } from "../middlewares/passwordMiddleware.js";
const router = express.Router();

router.post("/storeResultFromExcel", storeResultFromExcel);
router.get("/getAllResults", fetchAllResults);
router.post("/deleteResult", passwordMiddleware, deleteResults);
router.get("/fetchResult", fetchResult);

export default router;

