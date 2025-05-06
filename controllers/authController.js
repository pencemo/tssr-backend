import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";


export const signUp = async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    franchiseId,
    role,
    profileImg,
    studycenterId, 
  } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      franchiseId,
      role: role || "user",
      profileImg: profileImg || "",
      studycenterId, // ✅ Save studyCenterId reference
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please check your email.",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Account not verified. Please verify your account to proceed.",
      });
    }

    if (user.role === "studycenter_user") {
      const studyCenter = await StudyCenter.findById(user.studycenterId);
      console.log(studyCenter);
      if (!studyCenter) {
        return res.status(401).json({
          success: false,
          message: "Associated study center not found.",
        });
      }

      const currentDate = new Date();
      if (
        !studyCenter.renewalDate ||
        currentDate > new Date(studyCenter.renewalDate)
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Study center subscription has expired. Please renew your subscription.",
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          profileImg: user.profileImg,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};


// is Outh
export const isOuth = async (req, res) => {
  console.log(req.user);
  if(!req.user){
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User authenticated" , data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error to authenticate user" });
  }
}