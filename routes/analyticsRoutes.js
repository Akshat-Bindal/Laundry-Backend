import express from "express";
import { getSummaryAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary",protect, getSummaryAnalytics);

export default router;
