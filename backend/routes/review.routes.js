import express from "express"
import { authorize, isAuthenticated } from "../middleware/auth.middleware";
import { createReview } from "../controllers/review.controller";

const reviewRouter = express.Router()
reviewRouter.post("/" , isAuthenticated, authorize("User"), createReview)

export default reviewRouter;