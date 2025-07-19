import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";

export const passwordMiddleware = async(req, res, next) => {
   try {
     const password = req.body.password;
     if (!password) {
       return res
         .status(400)
         .json({ message: "Password is required", success: false });
     }
     const admin = await User.findById(req.user.id);
     if (!admin) {
       return res
         .status(404)
         .json({ message: "User not found", success: false });
     }
     const user = await User.findById(req.user.id);
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       return res
         .status(400)
         .json({ message: "Password is incorrect", success: false });
     }
     next();
   } catch (error) {
     return res.status(500).json({ message: error.message, success: false });
   }
}