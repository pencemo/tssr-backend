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
    role,
    profileImg,
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
      role: role || "user",
      profileImg: profileImg || "",
      isVerified: true,
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user._id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

export const login = async (req, res) => {
  const {email , password} = req.body;

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
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "Account not activated",
      });
      }

    let studyCenter = null;

    if (user.role === "studycenter_user") {
      studyCenter = await StudyCenter.findById(user.studycenterId);
      if (!studyCenter) {
        return res.status(401).json({
          success: false,
          message: "study center not found.",
        });
      }

      const currentDate = new Date();
      if (
        !studyCenter.renewalDate || 
        currentDate > new Date(studyCenter.renewalDate)
      ) {
        // If the renewal date is not set or has passed, set the study center to inactive
        studyCenter.isActive = false;
        await studyCenter.save();

        return res.status(401).json({
          success: false,
          message:
            "Study center subscription has expired.",
        });
      }
      if(studyCenter.isActive === false){
        return res.status(401).json({
          success: false,
          message:
            "Study center currently not available",
        });
      }
      if(studyCenter.isApproved === false){ 
        return res.status(401).json({
          success: false,
          message:
            "Study center is not approved.",
        });
      }
    }
    console.log("password", password)
    console.log("user password", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    var token = true;
    if (user.role === "admin") {
       token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, studycenterId: null },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    } else { 
       token = jwt.sign(
         { id: user._id, isAdmin: user.isAdmin, studycenterId: studyCenter._id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
       );
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ❗ set to false for localhost (no HTTPS)
      sameSite: "Lax", // ❗ use "Lax" or "Strict" for localhost (not "None")
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    

    
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          ...user._doc,
          password: null, // Exclude password from response
          ...(user.role === "studycenter_user" && {
            studyCenter: {
              id: studyCenter._id,
              name: studyCenter.name,
              regNo: studyCenter.regNo,
              renewalDate: studyCenter.renewalDate,
              isVerified: studyCenter.isVerified,
              isActive: studyCenter.isActive,
              place: studyCenter.place,
              district: studyCenter.district,
              pincode: studyCenter.pincode,
              state: studyCenter.state,
              centerHead: studyCenter.centerHead,
              atcId: studyCenter.atcId,
            },
          }),
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};
// is Outh
export const isOuth = async (req, res) => {
  if(!req.user){
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  try {
    console.log(req.user);
    let user = null;
    if (req.user.role == "admin") {
      user = await User.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id).populate("studycenterId", "name regNo renewalDate isVerified isActive place district pincode state centerHead atcId");
      console.log(user);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User authenticated" , data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error to authenticate user" });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};