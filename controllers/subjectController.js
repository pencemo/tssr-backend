import Subject from "../models/subjectSchema.js";


export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving subjects", error });
  }
};


export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving subject", error });
  }
};


export const createSubject = async (req, res) => {
  try {
    
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required fields" });
    }

    const subject = new Subject({
      name,
      code,
    });

    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    res.status(400).json({ message: "Error creating subject", error });
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  const { id } = req.params;

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update fields
    subject.name = req.body.name || subject.name;
    subject.code = req.body.code || subject.code;
    subject.isActive = req.body.isActive !== undefined ? req.body.isActive : subject.isActive;

    const updatedSubject = await subject.save();
    res.status(200).json({ message: "Subject updated successfully", subject: updatedSubject });
  } catch (error) {
    res.status(400).json({ message: "Error updating subject", error });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting subject", error });
  }
};
