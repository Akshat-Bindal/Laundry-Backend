import express from "express";
import { getSummaryAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", getSummaryAnalytics);

export default router;
