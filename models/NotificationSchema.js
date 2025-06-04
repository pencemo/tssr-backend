import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  attachedFileUrl: { type: String },
  receiverId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studycenter",
    },
  ],
  receiverIsAdmin: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Notification", NotificationSchema);
