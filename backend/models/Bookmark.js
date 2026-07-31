import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ poll: 1, user: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
