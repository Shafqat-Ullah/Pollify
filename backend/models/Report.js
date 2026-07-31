import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true, index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["spam", "offensive", "misleading", "duplicate", "other"],
      required: true,
    },
    details: { type: String, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
