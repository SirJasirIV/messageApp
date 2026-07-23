import express from "express";
const indexRouter = express.Router();
import { getConversations, getConversation, sendMessage, getUser, createConversation } from "../controllers/indexController.js";

import verifyUser from "../middleware/middleware.js";

indexRouter.get("/conversations", verifyUser, getConversations);

indexRouter.get(
  "/conversations/:conversationId",
  verifyUser,
  getConversation
);

indexRouter.post(
    "/conversations/:conversationId/messages",
    verifyUser,
    sendMessage
);

indexRouter.get(
  "/users",
  verifyUser,
  getUser
);

indexRouter.post("/conversations/create", verifyUser, createConversation);

export default indexRouter;