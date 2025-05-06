// backend/controllers/resultController.js
import Result from "../models/resultSchema.js";

// Get all results
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId")
      .populate("courseId");
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// Get a single result by ID
export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findById(id)
      .populate("studentId")
      .populate("courseId");
    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch result" });
  }
};

// Create a new result
export const createResult = async (req, res) => {
  try {
    const { studentId, courseId, status } = req.body;
    const newResult = new Result({ studentId, courseId, status });
    await newResult.save();
    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ error: "Failed to create result" });
  }
};

// Update a result by ID
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, courseId, status } = req.body;
    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { studentId, courseId, status },
      { new: true }
    );
    if (!updatedResult) {
      return res.status(404).json({ error: "Result not found" });
    }
    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(500).json({ error: "Failed to update result" });
  }
};

// Delete a result by ID
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedResult = await Result.findByIdAndDelete(id);
    if (!deletedResult) {
      return res.status(404).json({ error: "Result not found" });
    }
    res.status(200).json({ message: "Result deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete result" });
  }
};
