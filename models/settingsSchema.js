import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    reportsDownload: {
        type: Boolean,
        default: false
    },
    admissionPermission: {
        type: Boolean,
        default: false
    },
    studyCenterUpdatePermission: {
        type: Boolean,
        default: false
    },
    wholeAppLoginPermission: {
        type: Boolean,
        default: false
    },
    editStudentDataPermission: {
        type: Boolean,
        default: false
    }
})

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;