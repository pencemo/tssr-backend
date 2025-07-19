import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current directory path (ES Modules compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory
const uploadDir = path.join(__dirname, "..", "uploads", "students");

// Ensure upload directory exists
const ensureUploadDirExists = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Initialize directory check
ensureUploadDirExists();

// Storage configuration with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Re-check directory existence for each upload
    ensureUploadDirExists();
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname);
      const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    } catch (err) {
      cb(new Error("Failed to generate filename"));
    }
  },
});

// Enhanced file filter with better error messages
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!file) {
    return cb(new Error("No file provided"), false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype}). Only ${allowedTypes.join(
          ", "
        )} are allowed.`
      ),
      false
    );
  }
};

// Multer instance with comprehensive configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 5MB limit
    files: 2, // Maximum of 2 files
  },
  onError: function (err, next) {
    console.error("Multer error:", err);
    next(err);
  },
});

export default upload;

