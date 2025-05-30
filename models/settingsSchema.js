import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    // attendenceRegisterDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // attendenceReportDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // intermarkReportDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // OtherReportDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // classTestMarksheetDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // commissionMakSheetDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // craftAndPractiseMarksheetDownload: {
    //     type: Boolean,
    //     default: false
    // },
    // teachingPracticeMarksheetDownload: {
    //     type: Boolean,
    //     default: false
    // },
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
})

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;