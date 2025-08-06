import resultSchema from "../models/resultSchema.js";

export const storeResultFromExcel = async (req, res) => {
  try {
    const resultsArray = req.body;
    console.log("req.body;,",req.body)

    if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of results.",
      });
    }

    const parsedResults = resultsArray.map((resultData) => {
      const {
        admissionNumber,
        name,
        studyCenterName,
        examCenterName,
        courseName,
        duration,
        grade,
        remark,
        dateOfExam,
        subjects,
      } = resultData;

      if (
        !admissionNumber ||
        !name ||
        !studyCenterName ||
        !examCenterName ||
        !courseName ||
        !duration ||
        !dateOfExam ||
        !subjects ||
        subjects.length === 0
      ) {
        throw new Error("Missing required fields in one or more results.");
      }

      const parsedSubjects = subjects.map((subject) => ({
        name: subject.name?.trim(),
        grade: subject.grade?.trim(),
      }));

      return {
        admissionNumber,
        studentName: name,
        studyCenterName,
        examCenterName,
        courseName,
        duration,
        dateOfExam,
        grade,
        remark,
        subjects: parsedSubjects,
      };
    });

    const createdResults = await resultSchema.create(parsedResults); 

    return res.status(201).json({
      success: true,
      message: "All results uploaded successfully.",
      data: createdResults,
    });
  } catch (error) {
    console.error("Error uploading results:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading multiple results.",
    });
  }
};
