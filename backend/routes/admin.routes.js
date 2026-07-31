import express from "express";
import {
  getAdminStats,
  listUsers,
  banUser,
  listAllPolls,
  adminDeletePoll,
  listReports,
  resolveReport,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/dashboard", getAdminStats);
router.get("/users", listUsers);
router.patch("/users/:id/ban", banUser);
router.get("/polls", listAllPolls);
router.delete("/polls/:id", adminDeletePoll);
router.get("/reports", listReports);
router.patch("/reports/:id", resolveReport);

export default router;
