import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

likeSchema.index({ poll: 1, user: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
