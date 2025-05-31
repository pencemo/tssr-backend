import Settings from "../models/settingsSchema.js";

export const studyCenterUpdatePermission = async(req, res, next) => {
    try {
        const settings =await Settings.findOne();
        if (!settings) {
            return res.json({
                message: "Settings not found",
                success: false
            });
        }
        if (!settings.studyCenterUpdatePermission) {
          return res.json({
            message: "Update Permission Denied !",
            success: false,
          });
        }
    next();
    } catch (error) {
        res.status(500).json({message: error.message , success: false});   
    }
}