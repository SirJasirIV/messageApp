import express from "express";
const router = express.Router();
import { getSignup, getLogin, getMe, getConversations, getConversation } from "../controllers/authController.js"
import verifyUser from "../middleware/middleware.js"

router.post("/signup", getSignup);
router.post("/login", getLogin);
router.get("/me", verifyUser, getMe);
router.get("/conversations", verifyUser, getConversations)
router.get(
  "/conversations/:conversationId",
  verifyUser,
  getConversation
);
export default router;