import express from "express";
const router = express.Router();

import { getSignup, getLogin, getMe } from "../controllers/authController.js";

import verifyUser from "../middleware/middleware.js";

router.post("/signup", getSignup);
router.post("/login", getLogin);
router.get("/me", verifyUser, getMe);

export default router;