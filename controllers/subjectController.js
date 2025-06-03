import Subject from "../models/subjectSchema.js";

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true });

    res.status(200).json({
      success: true,
      message: "Fetched active subjects successfully",
      data: subjects,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error retrieving subjects",
      error: error.message,
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({data:subject});
  } catch (error) {
    res.status(400).json({ message: "Error retrieving subject", error });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required fields",
      });
    }

    const subject = new Subject({
      name,
      code,
      isActive: true,
    });

    const savedSubject = await subject.save();

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: savedSubject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating subject",
      error: error.message,
    });
  }
};

export const updateSubjectToggle = async (req, res) => {
  const { id } = req.query;
  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }


    subject.isActive = !subject.isActive;
      

    const updatedSubject = await subject.save();


    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating subject",
      error: error.message,
    });
  }
};

export const getAlltrueAndfalseSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();

    res.status(200).json({
      success: true,
      message: "Fetched active subjects successfully",
      data: subjects,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error retrieving subjects",
      error: error.message,
    });
  }
};
