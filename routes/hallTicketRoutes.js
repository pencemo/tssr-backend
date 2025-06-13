import express from "express";
import { hallTicketDownload } from "../controllers/hallTicketController.js";


const router = express.Router();

router.post('/DownloadhallTicket', hallTicketDownload);
export default router;

