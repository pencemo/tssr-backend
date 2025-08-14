import express from "express";
import { deleteResults, fetchAllResults, fetchResult, storeResultFromExcel, verifyCertificate } from "../controllers/resultController.js";
import { passwordMiddleware } from "../middlewares/passwordMiddleware.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/storeResultFromExcel", storeResultFromExcel);
router.get("/getAllResults", fetchAllResults);
router.post("/deleteResult",isAuthenticated, passwordMiddleware, deleteResults);
router.post("/fetchResult", fetchResult);
router.post("/verifyCertificate", verifyCertificate);

export default router;

