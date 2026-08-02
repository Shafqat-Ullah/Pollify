import express from "express";
import {
  createPoll,
  getPoll,
  updatePoll,
  deletePoll,
  setPollStatus,
  listPolls,
  getPollTypeStats,
  getPollVoteTimeline,
} from "../controllers/poll.controller.js";
import { castVote, getPollResults, removeVote } from "../controllers/vote.controller.js";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";
import { toggleLike } from "../controllers/like.controller.js";
import { toggleBookmark } from "../controllers/bookmark.controller.js";
import { createReport } from "../controllers/admin.controller.js";
import { protect, optionalAuth } from "../middlewares/auth.middleware.js";
import { createPollRules, voteRules, commentRules } from "../validators/poll.validator.js";
import { validate } from "../validators/auth.validator.js";
import { voteLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.get("/trending", getPollTypeStats);
router.get("/", optionalAuth, listPolls);
router.post("/", protect, createPollRules, validate, createPoll);

router.get("/:id", optionalAuth, getPoll);
router.get("/:id/votes/timeline", getPollVoteTimeline);
router.put("/:id", protect, updatePoll);
router.delete("/:id", protect, deletePoll);
router.patch("/:id/status", protect, setPollStatus);

router.post("/:id/vote", protect, voteLimiter, voteRules, validate, castVote);
router.post("/:id/unvote", protect, voteLimiter, removeVote);
router.get("/:id/results", getPollResults);

router.get("/:id/comments", getComments);
router.post("/:id/comments", protect, commentRules, validate, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);
router.post("/:id/report", protect, createReport);

export default router;
