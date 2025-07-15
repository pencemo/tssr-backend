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

NotificationSchema.index({ receiverIsAdmin: 1, createdAt: -1 }); // for admin
NotificationSchema.index({ receiverIsAdmin: 1, receiverId: 1, createdAt: -1 }); // for non-admin



export default mongoose.model("Notification", NotificationSchema);
