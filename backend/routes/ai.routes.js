import express from "express"
import { assistantChat } from "../controllers/ai.controller.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";

const aiRouter = express.Router();

// ASSISTANT CHAT
aiRouter.post("/aiChat",isAuthenticated, authorize("user"), assistantChat)

export default aiRouter