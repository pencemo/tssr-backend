// routes/subjectRoutes.js
import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

// Subject Routes
router.get("/getallsubjects", getAllSubjects);
router.get("/getsubjectbyid/:id", getSubjectById);
router.post("/create", createSubject);
router.put("/update/:id", updateSubject);
router.delete("/delete/:id", deleteSubject);

export default router;
