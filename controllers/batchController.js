import mongoose from "mongoose";
import Batch from "../models/batchSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";
import { getDateOnlyFromDate } from "../utils/dateUtils.js";
export const createBatch = async (req, res) => {
  const { courseId } = req.query;
  const { month, isAdmissionStarted } = req.body;

  const validMonths = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  // Validate courseId
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course ID",
    });
  }

  // Normalize and validate month
  const normalizedMonth = typeof month === "string" ? month.toLowerCase() : "";
  if (!normalizedMonth || !validMonths.includes(normalizedMonth)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing month",
    });
  }

  // Format month to Capitalized
  const formattedMonth =
    normalizedMonth.charAt(0).toUpperCase() + normalizedMonth.slice(1);

  try {
    const existing = await Batch.findOne({ courseId, month: formattedMonth });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Batch for this course already exists.",
      });
    }

    const newBatch = await Batch.create({
      courseId,
      month: formattedMonth,
      isAdmissionStarted: isAdmissionStarted,
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: newBatch,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBatchesOfCourse = async (req, res) => {
  const { courseId } = req.query;
  console.log("Course ID:", courseId);
  const monthOrder = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  // Validate courseId
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course ID",
    });
  }

  try {
    const batches = await Batch.find({ courseId });

    // Normalize month and sort
    const sortedBatches = batches.sort((a, b) => {
      const aMonth = (a.month || "").toLowerCase();
      const bMonth = (b.month || "").toLowerCase();
      return (monthOrder[aMonth] || 0) - (monthOrder[bMonth] || 0);
    });

    const currentDate = getDateOnlyFromDate(new Date());
    return res.status(200).json({
      success: true,
      message: `Fetched ${sortedBatches.length} batch(es) for the course sorted by month`,
      data: sortedBatches,
      currentDate,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching batches",
    });
  }
};

export const editAdmissionStatus = async (req, res) => {
  const { batchId } = req.query;
  const { date ,year } = req.body;
  try {
    // Validate date input
    if (!date || !date.from || !date.to) {
      return res.status(400).json({
        success: false,
        message: "Both date.from and date.to are required.",
      });
    }

    const startDate = getDateOnlyFromDate(new Date(date.from));
    const endDate = getDateOnlyFromDate(new Date(date.to));

    // Find the batch by ID
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Update the batch
    batch.isAdmissionStarted = true;
    batch.startDate = startDate;
    batch.endDate = endDate;
    batch.admissionYear = year;

    await batch.save();
    console.log("Batch updated successfully:", batch);

    return res.status(200).json({
      success: true,
      message: "Admission status and dates updated successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Error updating admission status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating admission status",
    });
  }
};

//update batch date
export const updateBatchDates = async (req, res) => {
  try {
    const { month, date, year } = req.body;

    // Validate required fields
    if (!month || !date || !date.from || !date.to) {
      return res.status(400).json({
        success: false,
        message: "month and date.from, date.to are required",
      });
    }

    // Convert to Date objects and remove time
    const startDate = getDateOnlyFromDate(new Date(date.from));
    const endDate = getDateOnlyFromDate(new Date(date.to));

    // Case-insensitive match for month
    const monthRegex = new RegExp(`^${month}$`, "i");

    // Step 1: Update batches
    const updateResult = await Batch.updateMany(
      { month: { $regex: monthRegex } },
      {
        $set: {
          startDate,
          endDate,
          isAdmissionStarted: true,
          admissionYear: year,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No batches found for the given month",
      });
    }

    // Step 2: Return updated batches
    const updatedBatches = await Batch.find({
      month: { $regex: monthRegex },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `${updateResult.modifiedCount} batch(es) updated successfully for month: ${month}`,
      data: updatedBatches,
    });
  } catch (error) {
    console.error("Error updating batches:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOpenOrManuallyStartedBatches = async (req, res) => {
  try {
    const today = new Date();

    const batches = await Batch.find({
      $or: [
        {
          startDate: { $lte: today },
          endDate: { $gte: today },
        },
        {
          isAdmissionStarted: true,
        },
      ],
    }).sort({ startDate: 1 });
  
    const currentDate = getDateOnlyFromDate(new Date());
    //console.log("Current Date:", currentDate);

    return res.status(200).json({
      success: true,
      message: `${batches.length} batch(es) found with active or manual admission.`,
      data: batches,
      currentDate: currentDate,
    });
  } catch (error) {
    console.error("Error fetching active batches:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admission Opened
export const getAdmissionOpenedBatches = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const perPage = 10;
  const currentDate = new Date();

  try {
    const batches = await Batch.find().populate("courseId", "name category duration");

    const filtered = batches.filter((batch) => {
      const courseName = batch.courseId?.name?.toLowerCase() || "";
      const batchMonth = batch.month?.toLowerCase() || "";
      const category = batch.courseId?.category?.toLowerCase() || "";
      const searchMatch =
        courseName.includes(search.toLowerCase()) || batchMonth.includes(search.toLowerCase()) || category.includes(search.toLowerCase());

      
      return (
        searchMatch &&
        (batch.isAdmissionStarted &&
       ( batch.startDate &&
        batch.endDate &&
        currentDate >= batch.startDate &&
        currentDate <= batch.endDate))
      );
    });

    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    res.json({
      totalPage: Math.ceil(filtered.length / perPage),
      currentPage: page,
      perPage,
      data: paginated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Admission Scheduled
export const getAdmissionScheduledBatches = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const perPage = 10;
  const currentDate = new Date();
  

  try {
    const batches = await Batch.find().populate("courseId", "name category duration");

    const filtered = batches.filter((batch) => {
      const courseName = batch.courseId?.name?.toLowerCase() || "";
      const batchMonth = batch.month?.toLowerCase() || "";
      const category = batch.courseId?.category?.toLowerCase() || "";
      const searchMatch =
        courseName.includes(search.toLowerCase()) || batchMonth.includes(search.toLowerCase()) || category.includes(search.toLowerCase());

      return (
        searchMatch &&
        batch.isAdmissionStarted &&
        batch.startDate &&
        batch.startDate > currentDate
      );
    });

    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    res.json({
      totalPage: Math.ceil(filtered.length / perPage),
      currentPage: page,
      perPage,
      data: paginated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Admission Not Available
export const getAdmissionNotAvailableBatches = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const perPage = 10;
  const currentDate = new Date();

  try {
    const batches = await Batch.find().populate(
      "courseId",
      "name category duration"
    );

    const filtered = batches.filter((batch) => {
      const courseName = batch.courseId?.name?.toLowerCase() || "";
      const batchMonth = batch.month?.toLowerCase() || "";
      const category = batch.courseId?.category?.toLowerCase() || "";
      const searchMatch =
        courseName.includes(search.toLowerCase()) ||
        batchMonth.includes(search.toLowerCase()) ||
        category.includes(search.toLowerCase());

      const isExpired = batch.endDate && currentDate > batch.endDate;

      return (
        searchMatch &&
        !batch.isAdmissionStarted ||
        isExpired
      );
    });

    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    res.json({
      totalPage: Math.ceil(filtered.length / perPage),
      page,
      perPage,
      data: paginated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const ToggleAdmissionStatusToClose = async (req, res) => {
  const { batchId } = req.query;

  if (!batchId) {
    return res.status(400).json({ message: "Batch ID is required", success: false });
  }

  try {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found",success: false });
    }

    // Update batch properties
    batch.isAdmissionStarted = false;

    const previousDate = new Date();
    const newdate = previousDate.setDate(previousDate.getDate() - 3);
    const expiredDate = getDateOnlyFromDate( new Date(newdate));

    
    batch.endDate = expiredDate;

    await batch.save();

    res.status(200).json({ message: "Batch updated successfully", batch ,success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getAdmissionOpenedBatchesOfaCourse = async (req, res) => {
  const courseId = req.query.courseId;
  const currentDate = new Date();

  if (!courseId) {
    return res
      .status(400)
      .json({ message: "courseId query parameter is required" });
  }

  try {
    const batches = await Batch.find({ courseId });

    const filtered = batches.filter((batch) => {
      return (
        batch.isAdmissionStarted &&
        batch.startDate &&
        batch.endDate &&
        currentDate >= batch.startDate &&
        currentDate <= batch.endDate
      );
    });

    res.json({ data: filtered });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// export const getAdmissionOpenBatchesByStudyCenter = async (req, res) => {
//   const studyCenterId = req.user.id; // Authenticated user
//   const currentDate = new Date();

//   try {
//     // Step 1: Fetch Study Center and its available courses
//     const studyCenter = await StudyCenter.findById(studyCenterId)
//       .populate("courses", "name category duration")
//       .lean();

//     if (!studyCenter) {
//       return res.status(404).json({ message: "Study center not found." });
//     }

//     const availableCourses = studyCenter.courses;

//     // Step 2: Fetch all batches for those courses
//     const allBatches = await Batch.find({
//       courseId: { $in: availableCourses.map((course) => course._id) },

//     })
//       .populate("courseId", "name category duration")
//       .lean();

//     // Step 3: Organize courses and filter their admission-open batches
//     const result = availableCourses.map((course) => {
//       const courseBatches = allBatches.filter((batch) => {
//         return (
//           batch.courseId &&
//           batch.courseId._id.toString() === course._id.toString() &&
//           batch.isAdmissionStarted === true &&
//           batch.startDate <= currentDate &&
//           batch.endDate >= currentDate
//         );
//       });

//       return {
//         courseId: course._id,
//         name: course.name,
//         category: course.category,
//         duration: course.duration,
//         admissionOpenBatches: courseBatches.sort((a, b) =>
//           a.month.localeCompare(b.month)
//         ),
//       };
//     });

//     // Step 4: Filter out courses that have no open batches
//     const filteredCourses = result.filter(
//       (course) => course.admissionOpenBatches.length > 0
//     );

//     return res.status(200).json({
//       success: true,
//       studyCenter: {
//         id: studyCenter._id,
//         name: studyCenter.name,
//       },
//       courses: filteredCourses,
//     });
//   } catch (err) {
//     console.error("Error fetching admission opened batches:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };


export const getAdmissionOpenBatchesByStudyCenter = async (req, res) => {
  const studyCenterId = req.user.id; // Authenticated study center
  const currentDate = new Date();

  try {
    // Step 1: Find the study center and its assigned courses
    const studyCenter = await StudyCenter.findById(studyCenterId)
      .populate("courses", "_id name category duration") // just the essential fields
      .lean();

    if (!studyCenter) {
      return res.status(404).json({ message: "Study center not found." });
    }

    const courseIds = studyCenter.courses.map((course) => course._id);

    // Step 2: Fetch only OPEN batches for those courses
    const openBatches = await Batch.find({
      courseId: { $in: courseIds },
      isAdmissionStarted: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .populate("courseId", "name category duration")
      .sort({ startDate: 1 }) // Optional: sort by soonest first
      .lean();

    return res.status(200).json({
      success: true,
      studyCenter: {
        id: studyCenter._id,
        name: studyCenter.name,
      },
      totalOpenBatches: openBatches.length,
      batches: openBatches,
    });
  } catch (err) {
    console.error("Error fetching open batches:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
