import express from "express";
import rateLimit from "express-rate-limit";
const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30 });
const indexRouter = express.Router();
import { uploadSingle } from "../middleware/upload.js";
import { blockGuests } from "../middleware/blockGuests.js";

import verifyUser from "../middleware/middleware.js";
import { getFeed, getPost, createPost, deletePost, likePost, unlikePost, commentOnPost } from "../controllers/postsController.js";
import { getConversations, getConversation, sendMessage, getUser, createConversation, uploadImage, updateMe, typeValidation } from "../controllers/indexController.js";
import { getUserProfile, followUser, unfollowUser, getAllUsers, getIncomingRequests, acceptFollowRequest, updateMyProfile } from "../controllers/followController.js";


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

indexRouter.get(
  "/all-users",
  verifyUser,
  getAllUsers
)

indexRouter.get(
  "/follow-requests",
  verifyUser,
  getIncomingRequests
)

indexRouter.post(
  "/follow-requests/:followerId/accept",
  verifyUser,
  acceptFollowRequest
)

indexRouter.post("/upload",
  verifyUser,
  blockGuests,
  uploadLimiter,
  uploadSingle, 
  uploadImage
);

indexRouter.patch(
  "/me", 
  verifyUser, 
  updateMe
);

export default indexRouter;