import jwt from 'jsonwebtoken'
import Settings from '../models/settingsSchema.js';
export const reportDownloadAccess = async (req, res,next) => {
    const user = req.user;
    try {
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success:false
             })
        }
        if (user.isAdmin) {
            next();
        } else {
            const settings = await Settings.findOne();
            const downloadPermission = settings.reportsDownload;
            if(!downloadPermission){
                return res.status(401).json({
                    message: "You don't have permission to download reports",
                    success:false
                })
            }
            next();
        }
     } catch (error) {
         return res.status(401).json({
             message: "error occurs in report Download Middleware .",
             success:false
        })
     }
 }