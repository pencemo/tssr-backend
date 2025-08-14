import enrollmentSchema from "../models/enrollmentSchema.js";
import resultSchema from "../models/resultSchema.js";
import Student from "../models/studentSchema.js";

export const storeResultFromExcel = async (req, res) => {
  try {
    const resultsArray = req.body.resultsArray;
    const examType = req.body.examType;
    console.log("Final Exam :", req.body);

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

      if (enrollment && examType === "final") {
        const isPassed = ["pass", "passed"].includes(
          remark.trim().toLowerCase()
        );

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
    const { search = "", page = 1, limit = 10 , filter = ""} = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { studentName: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { studyCenterName: { $regex: search, $options: "i" } },
      ],
    };

    if (filter) {
      query.courseName = { $regex: filter, $options: "i" };
    }

    console.log("Query  :", query);

    const resultsPromise = resultSchema
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const countPromise = resultSchema.countDocuments(query);
     const coursesPromise = resultSchema.distinct("courseName");

    const [results, total, courses] = await Promise.all([
      resultsPromise,
      countPromise,
      coursesPromise,
    ]);

    res.status(200).json({
      success: true,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: results,
      courses,
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

export const  fetchResult = async (req, res) => {
  try {
    const { admissionNumber, dob } = req.body;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required",
      });
    }

    const enrollment = await enrollmentSchema.findOne({ admissionNumber });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student enrollment not found",
      });
    }

    const result = await resultSchema.findOne({ admissionNumber }).sort({ createdAt: -1 });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (dob) {
      const student = await Student.findById(enrollment.studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student data not found",
        });
      }

      const providedDOB = new Date(dob);
      const actualDOB = new Date(student.dateOfBirth);

      const toLocalDateString = (date) => {
        return date.toLocaleDateString("en-CA"); 
      };

      const providedDate = toLocalDateString(providedDOB);
      const actualDate = toLocalDateString(actualDOB);

      if (providedDate !== actualDate) {
        return res.status(401).json({
          success: false,
          message: "Date of birth does not match our records",
        });
      }

      const { subjects, ...filteredResult } = result.toObject();
      return res.status(200).json({
        success: true,
        message: "Result fetched successfully",
        data: filteredResult,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Result fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const verifyCertificate = async (req, res) => {
  const {admissionNumber} = req.body
  if(!admissionNumber){
    return res.status(400).json({
      success: false,
      message: "Admission number is required",
    });
  }
  try{
    const Student = await enrollmentSchema.findOne({admissionNumber}).populate("studycenterId", "name").populate("studentId", "name dateOfBirth").populate("batchId", "month").populate("courseId", "name duration");
    if(!Student){
      return res.status(404).json({
        success: false,
        message: "Student not found"
      })
    }
    if(!Student.isCompleted){
      return res.status(404).json({
        success: false,
        message: "Student is not yet completed"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Student found",
      data: Student
    })
  }catch(error){
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}
