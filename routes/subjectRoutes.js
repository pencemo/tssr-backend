// routes/subjectRoutes.js
import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  getAlltrueAndfalseSubjects,
  updateSubjectToggle,
} from "../controllers/subjectController.js";

const router = express.Router();

// Subject Routes
router.get("/getAllSubjects", getAllSubjects);
router.get("/getsubjectbyid/:id", getSubjectById);
router.post("/create", createSubject);
router.put("/update", updateSubjectToggle);
router.get("/getAlltrueAndfalseSubjects", getAlltrueAndfalseSubjects);
export default router;
