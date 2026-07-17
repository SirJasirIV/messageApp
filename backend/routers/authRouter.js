import express from "express";
const router = express.Router();
import testController from "../controllers/authController.js"

router.post("/signup", testController);

export default router;