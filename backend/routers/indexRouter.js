import express from "express";
const indexRouter = express.Router();
import { getFeed, getPost, createPost, deletePost, likePost, unlikePost, commentOnPost } from "../controllers/postsController.js";
import { getConversations, getConversation, sendMessage, getUser, createConversation } from "../controllers/indexController.js";
import { getUserProfile, followUser, unfollowUser } from "../controllers/followController.js";

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

indexRouter.post(
  "/conversations/create",
  verifyUser,
  createConversation);

indexRouter.get(
  "/feed", 
  verifyUser, 
  getFeed);
  
indexRouter.get(
  "/posts/:postId", 
  verifyUser, 
  getPost);

indexRouter.post(
  "/posts", 
  verifyUser, 
  createPost);

indexRouter.delete(
  "/posts/:postId", 
  verifyUser, 
  deletePost);

indexRouter.post(
  "/posts/:postId/like", 
  verifyUser, 
  likePost);

indexRouter.delete(
  "/posts/:postId/like", 
  verifyUser, 
  unlikePost);

indexRouter.post(
  "/posts/:postId/comments", 
  verifyUser, 
  commentOnPost);

indexRouter.get(
  "/users/:userId", 
  verifyUser, 
  getUserProfile);

indexRouter.post(
  "/users/:userId/follow", 
  verifyUser, 
  followUser);

indexRouter.delete(
  "/users/:userId/follow",
   verifyUser, 
   unfollowUser);

export default indexRouter;