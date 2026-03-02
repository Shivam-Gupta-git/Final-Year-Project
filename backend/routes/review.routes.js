import express from "express";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { createReview, getReviewsByTarget } from "../controllers/review.controller.js";

const reviewRouter = express.Router();
reviewRouter.post("/", isAuthenticated, authorize("user"), createReview);
reviewRouter.get("/:targetType/:targetId", isAuthenticated,  getReviewsByTarget);

export default reviewRouter;
