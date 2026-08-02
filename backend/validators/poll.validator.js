import { body } from "express-validator";

export const createPollRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").optional().isLength({ max: 1000 }),
  body("type").optional().isIn(["single", "multiple", "image", "text", "yesno", "rating", "open"]),
  body("options")
    .optional()
    .custom((v, { req }) => {
      if (Array.isArray(v)) {
        const min = req.body.type === "open" ? 1 : 2;
        if (v.length < min) {
          throw new Error(`A poll needs at least ${min} options`);
        }
      }
      return true;
    }),
  body("visibility").optional().isIn(["public", "private", "unlisted"]),
  body("expiresAt").optional().isISO8601().withMessage("expiresAt must be a valid date"),
];

export const voteRules = [
  body("selectedOptions")
    .isArray({ min: 1 })
    .withMessage("At least one option must be selected"),
];

export const commentRules = [
  body("content").trim().notEmpty().withMessage("Comment cannot be empty").isLength({ max: 500 }),
];
