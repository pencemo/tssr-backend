import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";
import { sendEmail } from "../utils/sendEmail.js";


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
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV == "production" ? "none" : "lax", 
        maxAge: 7 * 24 * 60 * 60 * 1000
      })


    res.status(200).json({
      success: true,
      message: "Login successfull",
      data: {
        user: {
          ...user._doc,
          password: null,
          verificationCode: null,
          // Exclude password from response
          ...(user.role === "studycenter_user" && {
            studycenterId: {
              id: studyCenter._id,
              name: studyCenter.name,
              email: studyCenter.email,
              phoneNumber: studyCenter.phoneNumber,
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
              logo: studyCenter?.logo || "",
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
    let user = null;
    if (req.user.role == "admin") {
      user = await User.findById(req.user.id).select(
        "-password -__v -verificationCode"
      );
    } else {
      user = await User.findById(req.user.id)
        .select("-password -__v -verificationCode")
        .populate(
          "studycenterId",
          "name regNo email phoneNumber logo renewalDate isVerified isActive place district pincode state centerHead atcId"
        );
      
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });   
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    user.verificationCode = otp;
    user.codeExpires = expiry;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Forgot Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc;">

      <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <tr>
          <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px;">
            <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 10px;">TSSR Council</h1>
            <p style="color: #e2e8f0; font-size: 16px;">Password Reset Request</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 50px 30px; text-align: center;">
            <h2 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 40px; line-height: 1.8;">
              We received a request to reset your password. Use the code below to proceed. This code is valid for only 10 minutes.
            </p>

            <!-- Code Box -->
            <div style="background-color: #edf2f7; border: 2px dashed #cbd5e0; border-radius: 12px; padding: 30px; margin: 40px 0;">
              <p style="font-size: 14px; color: #718096; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Verification Code</p>
              <p style="font-size: 36px; font-weight: bold; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0 0 15px;">${otp}</p>
              <p style="font-size: 14px; color: #718096; font-style: italic;">Enter this code in the password reset form</p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #c05621; font-size: 16px; margin-bottom: 10px;">🔒 Security Notice</h3>
              <p style="color: #744210; font-size: 14px; line-height: 1.6;">
                If you didn't request this password reset, you can safely ignore this email. 
                We will never ask for your reset code via email.
              </p>
            </div>

            <p style="font-size: 14px; color: #718096;">
              Need help? Contact our team at 
              <a href="mailto:support@tssr.org" style="color: #667eea; text-decoration: none;">support@tssr.org</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px; margin-bottom: 15px;">
              This email was sent for password recovery from the TSSR Council.
            </p>
            <p style="color: #a0aec0; font-size: 12px;">
              © 2024 TSSR Council. All rights reserved.<br>
              123 Education Street, Kerala, India
            </p>
          </td>
        </tr>

      </table>

    </body>
    </html>
`
    );

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Send email error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.verificationCode !== otp ||
      new Date(user.codeExpires) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createNewPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.verificationCode = "";
    user.codeExpires = null;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
