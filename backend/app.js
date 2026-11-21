import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import router from "./routers/authRouter.js";
import indexRouter from "./routers/indexRouter.js";
import cleanupGuests from "./controllers/cleanUpGuest.js";

const app = express();
app.set("etag", false);
app.set("trust proxy", 1);

const HOUR = 60 * 60 * 1000;
setInterval(cleanupGuests, HOUR);
cleanupGuests();


app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("working!");
});

app.get("/health", (req, res) => res.send("ok"));

app.use("/auth", authLimiter, router);
app.use("/connect", indexRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default app;