import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 200 },
    image: { url: String, publicId: String },
    votesCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["single", "multiple", "image", "text", "yesno", "rating", "open"],
      default: "single",
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (v) {
          return this.type === "open" ? v.length >= 1 : v.length >= 2;
        },
        message: "A poll needs at least 2 options",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    isAnonymous: { type: Boolean, default: false },
    scheduledAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    totalVotes: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pollSchema.index({ createdAt: -1 });
pollSchema.index({ totalVotes: -1 });
pollSchema.index({ title: "text", description: "text", tags: "text" });

pollSchema.virtual("isExpired").get(function () {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

pollSchema.set("toJSON", { virtuals: true });
pollSchema.set("toObject", { virtuals: true });

export default mongoose.model("Poll", pollSchema);
