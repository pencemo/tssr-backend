import express from "express";
const router = express.Router();

// Controller functions (to be implemented in a separate controller file)
import {
  getAllResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult 
} from '../controllers/resultController.js';


router.get('/getAllResults', getAllResults);
router.get('/getResultById/:id', getResultById);
router.post('/createResult', createResult);
router.put('/updateResult/:id', updateResult);
router.delete('/deleteResult/:id', deleteResult);

export default router;
