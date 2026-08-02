import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const slugify = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const DEFAULT_OPTIONS = {
  yesno: ["Yes", "No"],
  rating: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
  open: ["Write your answer"],
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @route POST /api/polls
export const createPoll = asyncHandler(async (req, res) => {
  const {
    title,
    question,
    description,
    type,
    options,
    category,
    tags,
    visibility,
    isAnonymous,
    scheduledAt,
    expiresAt,
    status,
  } = req.body;

  // Category may be a name (from the create form). Resolve it, or create it on demand.
  let categoryId;
  if (category) {
    if (typeof category === "string") {
      const found = await Category.findOne({ name: { $regex: `^${escapeRegex(category)}$`, $options: "i" } });
      categoryId = found ? found._id : (await Category.create({ name: category, slug: slugify(category) }))._id;
    } else {
      categoryId = category;
    }
  }

  let pollOptions;
  if (type === "image") {
    // Image polls come as option objects: [{ text, image: { url } }]
    pollOptions = (options || []).map((o) => (typeof o === "string" ? { text: o } : o));
  } else {
    pollOptions = options && options.length ? options : DEFAULT_OPTIONS[type] || [];
    pollOptions = pollOptions.map((o) => (typeof o === "string" ? { text: o } : o));
  }

  const poll = await Poll.create({
    title: title ?? question,
    description,
    author: req.user._id,
    type,
    options: pollOptions,
    category: categoryId,
    tags,
    visibility,
    isAnonymous,
    scheduledAt,
    expiresAt,
    status: status === "published" ? "published" : "draft",
  });

  res.status(201).json({ success: true, data: { poll } });
});

// @route GET /api/polls/:id
export const getPoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id)
    .populate("author", "name username avatar")
    .populate("category", "name slug");

  if (!poll) throw new ApiError(404, "Poll not found.");

  // Only the author can view a draft
  if (poll.status === "draft" && (!req.user || String(poll.author._id) !== String(req.user._id))) {
    throw new ApiError(404, "Poll not found.");
  }

  poll.viewsCount += 1;
  await poll.save();

  let userVote = null;
  if (req.user) {
    userVote = await Vote.findOne({ poll: poll._id, voter: req.user._id });
  }

  res.status(200).json({ success: true, data: { poll, userVote } });
});

// @route PUT /api/polls/:id
export const updatePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");
  if (String(poll.author) !== String(req.user._id)) {
    throw new ApiError(403, "You can only edit your own polls.");
  }

  const editableFields = [
    "title",
    "description",
    "category",
    "tags",
    "visibility",
    "expiresAt",
    "scheduledAt",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) poll[field] = req.body[field];
  });

  // Options can only be edited before any votes are cast
  if (req.body.options && poll.totalVotes === 0) {
    poll.options = req.body.options.map((o) => (typeof o === "string" ? { text: o } : o));
  }

  await poll.save();
  res.status(200).json({ success: true, data: { poll } });
});

// @route DELETE /api/polls/:id
export const deletePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");
  if (String(poll.author) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own polls.");
  }

  await Promise.all([poll.deleteOne(), Vote.deleteMany({ poll: poll._id })]);

  res.status(200).json({ success: true, message: "Poll deleted." });
});

// @route PATCH /api/polls/:id/status  { status: "published" | "closed" | "draft" }
export const setPollStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["draft", "published", "closed"].includes(status)) {
    throw new ApiError(400, "Invalid status.");
  }

  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, "Poll not found.");
  if (String(poll.author) !== String(req.user._id)) {
    throw new ApiError(403, "You can only manage your own polls.");
  }

  poll.status = status;
  await poll.save();

  res.status(200).json({ success: true, data: { poll } });
});

// @route GET /api/polls   — explore feed with search, category, sort, pagination
export const listPolls = asyncHandler(async (req, res) => {
  const { search, category, tag, type, sort = "newest", page = 1, limit = 12, author, feed } = req.query;

  const query = { status: "published", visibility: "public" };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (type) query.type = type;
  if (author) query.author = author;
  if (feed === "following") {
    if (!req.user) throw new ApiError(401, "Please log in to view your following feed.");
    query.author = { $in: req.user.following };
  }
  if (search) query.$text = { $search: search };

  const sortMap = {
    newest: { createdAt: -1 },
    trending: { totalVotes: -1, viewsCount: -1 },
    mostVoted: { totalVotes: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [polls, total] = await Promise.all([
    Poll.find(query)
      .populate("author", "name username avatar")
      .populate("category", "name slug")
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(Number(limit)),
    Poll.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      polls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + polls.length < total,
      },
    },
  });
});
