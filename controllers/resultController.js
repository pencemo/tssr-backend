import enrollmentSchema from "../models/enrollmentSchema.js";
import resultSchema from "../models/resultSchema.js";

export const storeResultFromExcel = async (req, res) => {
  try {
    const resultsArray = req.body;

    if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of results.",
      });
    }

    const createdResults = [];

    for (const resultData of resultsArray) {
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

      const newResult = await resultSchema.create({
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
      });

      createdResults.push(newResult);

      const enrollment = await enrollmentSchema.findOne({ admissionNumber });

      if (enrollment) {
        const isPassed = ["pass","passed"].includes(remark.trim().toLowerCase());

        enrollment.isCompleted = true;
        enrollment.isPassed = isPassed;
        enrollment.isCertificateIssued = isPassed;

        await enrollment.save();

      }
    }

    return res.status(201).json({
      success: true,
      message: "All results uploaded and enrollments updated successfully.",
      data: createdResults,
    });
  } catch (error) {
    console.error("Error uploading results:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading results and updating enrollments.",
      error: error.message,
    });
  }
};


export const fetchAllResults = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { studentName: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { courseName: { $regex: search, $options: "i" } },
        { examCenterName: { $regex: search, $options: "i" } },
        { studyCenterName: { $regex: search, $options: "i" } },
      ],
    };

    const resultsPromise = resultSchema
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const countPromise = resultSchema.countDocuments(query);

    const [results, total] = await Promise.all([resultsPromise, countPromise]);

    res.status(200).json({
      success: true,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch results.",
      error: error.message,
    });
  }
};

export const deleteResults = async (req, res) => {
  try {
    const { allDelete, resultIds } = req.body;

    if (allDelete === true) {
      await resultSchema.deleteMany({});
      return res.status(200).json({
        success: true,
        message: "All results deleted successfully.",
      });
    }

    if (!Array.isArray(resultIds) || resultIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of IDs to delete.",
      });
    }

    const deleted = await resultSchema.deleteMany({ _id: { $in: resultIds } });
    
    return res.status(200).json({
      success: true,
      message: `${deleted.deletedCount} result(s) deleted successfully.`,
    });

  } catch (error) {
    console.error("Error deleting results:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting results.",
      error: error.message,
    });
  }
};

