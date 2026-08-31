import express from "express";
const router = express.Router();

import { getSignup, getLogin, getMe, guestLogin } from "../controllers/authController.js";

import verifyUser from "../middleware/middleware.js";

router.post("/signup", getSignup);
router.post("/login", getLogin);
router.get("/me", verifyUser, getMe);
router.post("/guest", guestLogin);

export default router;